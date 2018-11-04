import Octokit from '@octokit/rest'
import fs from 'fs'
import path from 'path'
import execa from 'execa'
import yaml from 'js-yaml'
import Context from './context'

export default class Toolkit {
  public context: Context

  /**
   * Path to a clone of the repository
   */
  public workspace: string | undefined

  constructor () {
    this.context = new Context()
    this.workspace = process.env.GITHUB_WORKSPACE || undefined
  }

  /**
   * Returns an authenticated Octokit client
   */
  createOctokit () {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('No `GITHUB_TOKEN` environment variable found, could not authenticate Octokit client.')
    }
    const octokit = new Octokit()

    octokit.authenticate({
      type: 'token',
      token: process.env.GITHUB_TOKEN
    })

    return octokit
  }

  /**
   * Gets a file in your project's workspace
   *
   * @param {string} filename - Filename
   * @param {string} [encoding='utf8'] - Encoding
   */
  getFile (filename: string, encoding = 'utf8') {
    if (!this.workspace) throw new Error('No workspace was found.')
    const pathToFile = path.join(this.workspace, filename)
    if (!fs.existsSync(pathToFile)) throw new Error(`File ${filename} could not be found in your project's workspace.`)
    return fs.readFileSync(pathToFile, encoding)
  }

  /**
   * Get the package.json file in the project root
   */
  getPackageJSON () {
    if (!this.workspace) throw new Error('No workspace was found.')
    const pathToPackage = path.join(this.workspace, 'package.json')
    if (!fs.existsSync(pathToPackage)) throw new Error('package.json could not be found in your project\'s root.')
    return require(pathToPackage)
  }

  /**
   * Get the configuration settings for this action in the project workspace.
   *
   * @param {string} key - If this starts with a `.`, it will look for a file starting with `.`.
   * If it is a YAML file, it will return it as JSON. Otherwise, it will return the value of the property in
   * the `package.json` file of the project.
   */
  config (key: string) : object {
    if (!this.workspace) throw new Error('No workspace was found.')

    if (key.startsWith('.') && key.endsWith('rc')) {
      // It's a file like .npmrc or .eslintrc!
      const pathToRcFile = path.join(this.workspace, key)
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
   */
  async runInWorkspace (command: string, args: string[], cwd = this.workspace, opts: object) {
    return execa(command, args, { cwd, ...opts })
  }
}
