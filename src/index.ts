import execa, { Options as ExecaOptions } from 'execa'
import fs from 'fs'
import yaml from 'js-yaml'
import minimist, { ParsedArgs } from 'minimist'
import path from 'path'
import { Signale } from 'signale'
import { Context } from './context'
import { Exit } from './exit'
import { GitHub } from './github'
import { Store } from './store'

export interface ToolkitOptions {
  event?: string | string[],
  logger?: Signale
}

export class Toolkit {
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
   * An object of the parsed arguments passed to your action
   */
  public arguments: ParsedArgs

  /**
   * An Octokit SDK client authenticated for this repository. See https://octokit.github.io/rest.js for the API.
   *
   * ```js
   * const newIssue = await tools.github.issues.create(context.repo({
   *   title: 'New issue!',
   *   body: 'Hello Universe!'
   * }))
   * ```
   */
  public github: GitHub

  public opts: ToolkitOptions

  /**
   * A collection of methods used to stop an action while it's being run
   */
  public exit: Exit

  /**
   * A general-purpose logger. An instance of [Signale](https://github.com/klaussinani/signale)
   */
  public log: Signale

  constructor (opts: ToolkitOptions = {}) {
    this.opts = opts

    // Disable the underline to prevent extra white space in the Actions log output
    this.log = opts.logger || new Signale({ config: { underlineLabel: false } })

    // Print a console warning for missing environment variables
    this.warnForMissingEnvVars()

    this.exit = new Exit()
    this.context = new Context()
    this.workspace = process.env.GITHUB_WORKSPACE as string
    this.token = process.env.GITHUB_TOKEN as string
    this.github = new GitHub(this.token)
    this.arguments = minimist(process.argv.slice(2))
    this.store = new Store(this.context.workflow, this.workspace)
    this.checkAllowedEvents()
  }

  /**
   * Gets the contents file in your project's workspace
   *
   * ```js
   * const myFile = tools.getFile('README.md')
   * ```
   *
   * @param filename - Name of the file
   * @param encoding - Encoding (usually utf8)
   */
  public getFile (filename: string, encoding = 'utf8') {
    const pathToFile = path.join(this.workspace, filename)
    if (!fs.existsSync(pathToFile)) throw new Error(`File ${filename} could not be found in your project's workspace.`)
    return fs.readFileSync(pathToFile, encoding)
  }

  /**
   * Get the package.json file in the project root
   *
   * ```js
   * const pkg = toolkit.getPackageJSON()
   * ```
   */
  public getPackageJSON (): object {
    const pathToPackage = path.join(this.workspace, 'package.json')
    if (!fs.existsSync(pathToPackage)) throw new Error('package.json could not be found in your project\'s root.')
    return require(pathToPackage)
  }

  /**
   * Get the configuration settings for this action in the project workspace.
   *
   * @param key - If this is a string like `.myfilerc` it will look for that file.
   * If it's a YAML file, it will parse that file as a JSON object. Otherwise, it will
   * return the value of the property in the `package.json` file of the project.
   *
   * @example This method can be used in three different ways:
   *
   * ```js
   * // Get the .rc file
   * const cfg = toolkit.config('.myactionrc')
   *
   * // Get the YAML file
   * const cfg = toolkit.config('myaction.yml')
   *
   * // Get the property in package.json
   * const cfg = toolkit.config('myaction')
   * ```
   */
  public config (key: string): object {
    if (/\..+rc/.test(key)) {
      // It's a file like .npmrc or .eslintrc!
      return JSON.parse(this.getFile(key))
    } else if (key.endsWith('.yml') || key.endsWith('.yaml')) {
      // It's a YAML file! Gotta serialize it!
      return yaml.safeLoad(this.getFile(key))
    } else {
      // It's a regular object key in the package.json
      const pkg = this.getPackageJSON() as any
      return pkg[key]
    }
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
   * Returns true if this event is allowed
   */
  private eventIsAllowed (event: string) {
    const [eventName, action] = event.split('.')

    if (action) {
      return eventName === this.context.event && this.context.payload.action === action
    }

    return eventName === this.context.event
  }

  private checkAllowedEvents () {
    const { event } = this.opts
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
      'GITHUB_SHA',
      'GITHUB_REF',
      'GITHUB_TOKEN'
    ]

    const requiredButMissing = requiredEnvVars.filter(key => !process.env.hasOwnProperty(key))
    if (requiredButMissing.length > 0) {
      // This isn't being run inside of a GitHub Action environment!
      const list = requiredButMissing.map(key => `- ${key}`).join('\n')
      const warning = `There are environment variables missing from this runtime, but would be present on GitHub.\n${list}`
      this.log.warn(warning)
    }
  }
}
