import * as core from '@actions/core'
import execa, { Options as ExecaOptions } from 'execa'
import fs, { BaseEncodingOptions } from 'fs'
import minimist, { ParsedArgs } from 'minimist'
import path from 'path'
import { LoggerFunc, Signale } from 'signale'
import { Octokit } from '@octokit/rest'
import { Context } from './context'
import { Exit } from './exit'
import { getBody } from './get-body'
import { Store } from './store'
import { createInputProxy, InputType } from './inputs'

export interface ToolkitOptions {
  /**
   * An optional event or list of events that are supported by this Action. If
   * a different event triggers this Action, it will exit with a neutral status.
   */
  event?: string | string[],
  /**
   * An optional list of secrets that are required for this Action to function. If
   * any secrets are missing, this Action will exit with a failing status.
   */
  secrets?: string[],
  logger?: Signale,
  /**
   * GitHub token to use for authentication.
   * Uses `process.env.GITHUB_TOKEN` by default.
   */
  token?: string
}

export class Toolkit<I extends InputType = InputType> {
  /**
   * Run an asynchronous function that accepts a toolkit as its argument, and fail if
   * an error occurs.
   *
   * @param func - Async function to run
   * @param [opts] - Options to pass to the toolkit
   *
   * @example This is generally used to run a `main` async function:
   *
   * ```js
   * Toolkit.run(async tools => {
   *   // Action code here.
   * }, { event: 'push' })
   * ```
   */
  public static async run <I extends InputType = InputType> (func: (tools: Toolkit<I>) => unknown, opts?: ToolkitOptions) {
    const tools = new Toolkit<I>(opts)

    try {
      const ret = func(tools)
      // If the return value of the provided function is an unresolved Promise
      // await that Promise before return the value, otherwise return as normal
      return ret instanceof Promise ? await ret : ret
    } catch (err) {
      core.setFailed(err.message)
      tools.exit.failure(err)
    }
  }

  public context: Context

  /**
   * A key/value store for arbitrary data that can be accessed across actions in a workflow
   */
  public store: Store

  /**
   * Path to a clone of the repository
   */
  public workspace: string

  /**
   * GitHub API token
   */
  public token: string

  /**
   * An Octokit SDK client authenticated for this repository. See https://octokit.github.io/rest.js for the API.
   *
   * ```js
   * const newIssue = await tools.github.issues.create({
   *   ...tools.context.repo,
   *   title: 'New issue!',
   *   body: 'Hello Universe!'
   * })
   * ```
   */
  public github: Octokit

  public opts: ToolkitOptions

  /**
   * A collection of methods used to stop an action while it's being run
   */
  public exit: Exit

  /**
   * A general-purpose logger. An instance of [Signale](https://github.com/klaussinani/signale)
   */
  public log: Signale & LoggerFunc

  /**
   * An object of the inputs provided to your action. These can all be `undefined`!
   */
  public inputs: I

  constructor (opts: ToolkitOptions = {}) {
    this.opts = opts

    // Create the logging instance
    this.log = this.wrapLogger(
      opts.logger || new Signale({ config: { underlineLabel: false } })
    )

    // Print a console warning for missing environment variables
    this.warnForMissingEnvVars()

    // Memoize environment variables and arguments
    this.workspace = process.env.GITHUB_WORKSPACE as string
    this.token = opts.token || process.env.GITHUB_TOKEN as string

    // Setup nested objects
    this.exit = new Exit(this.log)
    this.context = new Context()
    this.github = new Octokit({ auth: `token ${this.token}` })
    this.store = new Store(this.context.workflow, this.workspace)

    // Memoize our Proxy instance
    this.inputs = createInputProxy<I>()

    // Check stuff
    this.checkAllowedEvents(this.opts.event)
    this.checkRequiredSecrets(this.opts.secrets)
  }

  /**
   * Gets the contents of a file in your project's workspace
   *
   * ```js
   * const myFile = tools.readFile('README.md')
   * ```
   *
   * @param filename - Name of the file
   * @param encoding - Encoding (usually utf8)
   */
  public async readFile (filename: string, encoding: BaseEncodingOptions['encoding'] = 'utf8') {
    const pathToFile = path.join(this.workspace, filename)

    if (!fs.existsSync(pathToFile)) {
      throw new Error(`File ${filename} could not be found in your project's workspace. You may need the actions/checkout action to clone the repository first.`)
    }

    return fs.promises.readFile(pathToFile, encoding)
  }

  /**
   * Get the package.json file in the project root
   *
   * ```js
   * const pkg = toolkit.getPackageJSON()
   * ```
   */
  public getPackageJSON <T = object> (): T {
    const pathToPackage = path.join(this.workspace, 'package.json')
    if (!fs.existsSync(pathToPackage)) throw new Error('package.json could not be found in your project\'s root.')
    return require(pathToPackage)
  }

  /**
   * Run a CLI command in the workspace. This runs [execa](https://github.com/sindresorhus/execa)
   * under the hood so check there for the full options.
   *
   * @param command - Command to run
   * @param args - Argument (this can be a string or multiple arguments in an array)
   * @param cwd - Directory to run the command in
   * @param [opts] - Options to pass to the execa function
   */
  public async runInWorkspace (command: string, args?: string[] | string, opts?: ExecaOptions) {
    if (typeof args === 'string') args = [args]
    return execa(command, args, { cwd: this.workspace, ...opts })
  }

  /**
   * Run the handler when someone triggers the `/command` in a comment body.
   *
   * @param command - Command to listen for
   * @param handler - Handler to run when the command is used
   */
  public async command (command: string, handler: (args: ParsedArgs | {}, match: RegExpExecArray) => Promise<void>) {
    // Don't trigger for bots
    if (this.context.payload.sender && this.context.payload.sender.type === 'Bot') {
      return
    }

    this.checkAllowedEvents([
      'pull_request',
      'issues',
      'issue_comment',
      'commit_comment',
      'pull_request_review',
      'pull_request_review_comment'
    ])

    const reg = new RegExp(`^/${command}(?:$|\\s(.*))`, 'gm')

    const body = getBody(this.context.payload)
    if (!body) return

    let match: RegExpExecArray | null

    // eslint-disable-next-line no-cond-assign
    while (match = reg.exec(body)) {
      if (match[1]) {
        await handler(minimist(match[1].split(' ')), match)
      } else {
        await handler({}, match)
      }
    }
  }

  /**
   * Returns true if this event is allowed
   */
  private eventIsAllowed (event: string) {
    const [eventName, action] = event.split('.')

    if (action) {
      return eventName === this.context.event && this.context.payload.action === action
    }

    return eventName === this.context.event
  }

  private checkAllowedEvents (event: string | string[] | undefined) {
    if (!event) return

    const passed = Array.isArray(event)
      ? event.some(e => this.eventIsAllowed(e))
      : this.eventIsAllowed(event)

    if (!passed) {
      const actionStr = this.context.payload.action ? `.${this.context.payload.action}` : ''
      this.log.error(`Event \`${this.context.event}${actionStr}\` is not supported by this action.`)
      this.exit.neutral()
    }
  }

  /**
   * Wrap a Signale logger so that its a callable class
   */
  private wrapLogger (logger: Signale) {
    // Create a callable function
    const fn = logger.info.bind(logger)
    // Add the log methods onto the function
    const wrapped = Object.assign(fn, logger)
    // Clone the prototype
    Object.setPrototypeOf(wrapped, logger)
    return wrapped
  }

  /**
   * Log warnings to the console for missing environment variables
   */
  private warnForMissingEnvVars () {
    const requiredEnvVars = [
      'HOME',
      'GITHUB_WORKFLOW',
      'GITHUB_ACTION',
      'GITHUB_ACTOR',
      'GITHUB_REPOSITORY',
      'GITHUB_EVENT_NAME',
      'GITHUB_EVENT_PATH',
      'GITHUB_WORKSPACE',
      'GITHUB_SHA'
    ]

    const requiredButMissing = requiredEnvVars.filter(key => !Object.prototype.hasOwnProperty.call(process.env, key))
    if (requiredButMissing.length > 0) {
      // This isn't being run inside of a GitHub Action environment!
      const list = requiredButMissing.map(key => `- ${key}`).join('\n')
      const warning = `There are environment variables missing from this runtime, but would be present on GitHub.\n${list}`
      this.log.warn(warning)
    }
  }

  /**
   * The Action should fail if there are secrets it needs but does not have
   */
  private checkRequiredSecrets (secrets?: string[]) {
    if (!secrets || secrets.length === 0) return
    // Filter missing but required secrets
    const requiredButMissing = secrets.filter(key => !Object.prototype.hasOwnProperty.call(process.env, key))
    // Everything we need is here
    if (requiredButMissing.length === 0) return
    // Exit with a failing status
    const list = requiredButMissing.map(key => `- ${key}`).join('\n')
    this.exit.failure(`The following secrets are required for this GitHub Action to run:\n${list}`)
  }
}
