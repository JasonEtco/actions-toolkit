const GitHub = require('@octokit/rest')
const fs = require('fs')
const path = require('path')
const execa = require('execa')
const yaml = require('js-yaml')
const Context = require('./context')

module.exports = class Toolkit {
  constructor (opts) {
    this.opts = opts
    this.context = new Context()
    this.workspace = {
      path: process.env.GITHUB_WORKSPACE
    }
  }

  /**
   * Returns an authenticated Octokit client
   *
   * @returns {object}
   */
  createOctokit () {
    const octokit = new GitHub()
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
   *
   * @returns {string}
   */
  getFile (filename, encoding = 'utf8') {
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
    const pathToPackage = path.join(this.path, 'package.json')
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
  config (key) {
    if (key.startsWith('.') && key.endWith('rc')) {
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
  async runInWorkspace (command, args, subdirectory) {
    const cwd = path.join(this.path, subdirectory)
    const result = await execa(command, args, { cwd, reject: false })

    if (result.exitCode && result.exitCode !== 0) {
      const error = result.stderr
      throw new Error(error)
    }

    return result
  }
}
