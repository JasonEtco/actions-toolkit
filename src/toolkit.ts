import Octokit from '@octokit/rest'
import fs from 'fs'
import path from 'path'
import execa from 'execa'
import yaml from 'js-yaml'
import Context from './context'

export interface Workspace {
  path: string
}

export default class Toolkit {
  public context: Context
  public workspace: Workspace

  constructor () {
    this.context = new Context()
    this.workspace = {
      path: String(process.env.GITHUB_WORKSPACE)
    }
  }

  /**
   * Returns an authenticated Octokit client
   *
   * @returns {object}
   */
  createOctokit () {
    const octokit = new Octokit()

    octokit.authenticate({
      type: 'token',
      token: String(process.env.GITHUB_TOKEN)
    })

    return octokit
  }

  /**
   * Gets a file in your project's workspace
   *
   * @param {string} filename - Filename
   * @param {string} [encoding='utf8'] - Encoding
   *
   * @returns {string}
   */
  getFile (filename: string, encoding = 'utf8') : string {
    const pathToFile = path.join(this.workspace.path, filename)
    if (!fs.existsSync(pathToFile)) throw new Error(`File ${filename} could not be found in your project's workspace.`)
    return fs.readFileSync(pathToFile, encoding)
  }

  /**
   * Get the package.json file in the project root
   *
   * @returns {object}
   */
  getPackageJSON () {
    const pathToPackage = path.join(this.workspace.path, 'package.json')
    if (!fs.existsSync(pathToPackage)) throw new Error('package.json could not be found in your project\'s root.')
    return require(pathToPackage)
  }

  /**
   * Get the configuration settings for this action in the project workspace.
   *
   * @param {string} key - If this starts with a `.`, it will look for a file starting with `.`.
   * If it is a YAML file, it will return it as JSON. Otherwise, it will return the value of the property in
   * the `package.json` file of the project.
   *
   * @returns {object}
   */
  config (key: string) {
    if (key.startsWith('.') && key.endsWith('rc')) {
      // It's a file like .npmrc or .eslintrc!
      const pathToRcFile = path.join(this.workspace.path, key)
      if (!fs.existsSync(pathToRcFile)) throw new Error(`File ${key} could not be found in your project's workspace.`)
      return require(pathToRcFile)
    } else if (key.endsWith('.yml') || key.endsWith('.yaml')) {
      // It's a YAML file! Gotta serialize it!
      return yaml.safeLoad(this.getFile(key))
    } else {
      // It's a regular object key in the package.json
      const pkg = this.getPackageJSON()
      return pkg[key]
    }
  }

  /**
   * Run a CLI command in the workspace
   *
   * @param {string} command - Command to run
   * @param {string[]} args - Arguments
   * @param {string} [subdirectory] - Subdirectory to run the command in
   *
   * @returns {Promise<object>}
   */
  async runInWorkspace (command: string, args: string[], cwd = this.workspace.path, opts: object) {
    return execa(command, args, { cwd, ...opts })
  }
}
