import Octokit from '@octokit/rest'
import fs from 'fs'
import path from 'path'
import execa from 'execa'
import yaml from 'js-yaml'
import Context from './context'

class Toolkit {
  public context: Context

  /**
   * Path to a clone of the repository
   */
  public workspace: string
  /**
   * GitHub API token
   */
  public token: string

  constructor () {
    // Print a console warning for missing environment variables
    this.warnForMissingEnvVars()

    this.context = new Context()
    this.workspace = process.env.GITHUB_WORKSPACE as string
    this.token = process.env.GITHUB_TOKEN as string
  }

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
    
    const requiredButMissing = requiredEnvVars.filter(key => process.env.hasOwnProperty(key))
    if (requiredButMissing.length > 0) {
      // This isn't being run inside of a GitHub Action environment!
      console.warn(`There are environment variables missing from this runtime, but would be present on GitHub.\n${requiredButMissing.map(key => `- ${key}`).join('\n')}`)
    }
  }

  /**
   * Returns an authenticated Octokit client.
   */
  createOctokit () {
    if (!this.token) {
      throw new Error('No `GITHUB_TOKEN` environment variable found, could not authenticate Octokit client.')
    }

    const octokit = new Octokit()

    octokit.authenticate({
      type: 'token',
      token: this.token
    })

    return octokit
  }

  /**
   * Gets a file in your project's workspace
   *
   * @param filename - Name of the file
   * @param encoding - Encoding (usually utf8)
   */
  getFile (filename: string, encoding = 'utf8') {
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
  getPackageJSON () : object {
    const pathToPackage = path.join(this.workspace, 'package.json')
    if (!fs.existsSync(pathToPackage)) throw new Error('package.json could not be found in your project\'s root.')
    return require(pathToPackage)
  }

  /**
   * Get the configuration settings for this action in the project workspace.
   *
   * @param key - If this is a string like `.myfilerc` it will look for that file.
   * If it is a YAML file, it will return it as a JSON object. Otherwise, it will return the value of the property in
   * the `package.json` file of the project.
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
  config (key: string) : object {
    if (/\..+rc/.test(key)) {
      // It's a file like .npmrc or .eslintrc!
      const pathToRcFile = path.join(this.workspace, key)
      if (!fs.existsSync(pathToRcFile)) throw new Error(`File ${key} could not be found in your project's workspace.`)
      return require(pathToRcFile)
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
   * Run a CLI command in the workspace
   *
   * @param command - Command to run
   * @param args - Arguments
   * @param cwd - Directory to run the command in
   * @param opts - 
   */
  async runInWorkspace (command: string, args: string[], cwd = this.workspace, opts: object) {
    return execa(command, args, { cwd, ...opts })
  }
}

export default Toolkit
module.exports = Toolkit