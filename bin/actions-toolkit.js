#!/usr/bin/env node
// @ts-check

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const minimist = require('minimist')
const { prompt } = require('enquirer')
const colors = require('./colors.json')
const icons = require('./feather-icons.json')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

const templateDir = path.join(__dirname, 'template')

/** A predicate function to ensure a string is not empty. */
const isNotEmpty = value => value.length > 0

/**
 * The options object returned from the CLI questionnaire prompt.
 * @typedef {object} PromptOptions
 * @property {string} name
 * @property {string} description
 * @property {string} icon
 * @property {string} color
 */

/**
 * @returns {Promise<PromptOptions>}
 */
const getActionMetadata = async () => {
  try {
    return await prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of your action?',
        initial: 'Your action name',
        validate: isNotEmpty
      },
      {
        type: 'input',
        name: 'description',
        message: 'What is a short description of your action?',
        initial: 'A description of your action',
        validate: isNotEmpty
      },
      {
        type: 'autocomplete',
        name: 'icon',
        message: 'Choose an icon for your action. Visit https://feathericons.com for a visual reference.',
        choices: icons
      },
      {
        type: 'autocomplete',
        name: 'color',
        message: 'Choose a background color background color used in the visual workflow editor for your action.',
        choices: colors
      }
    ])
  } catch (err) {
    // When prompt() rejects, that means the user has pressed ctrl+c to cancel input.
    throw new Error('Cancelled. Maybe next time!')
  }
}

/**
 *
 * @param {PromptOptions} options
 * @returns {Promise<string>} The Dockerfile contents.
 */
const createDockerfile = async (options) => {
  const dockerfileTemplate = await readFile(path.join(templateDir, 'Dockerfile'), 'utf8')
  return dockerfileTemplate
    .replace(':NAME', options.name)
    .replace(':DESCRIPTION', options.description)
    .replace(':ICON', options.icon)
    .replace(':COLOR', options.color)
}

const createPackageJson = (name) => {
  const { version } = require('../package.json')
  return {
    name,
    private: true,
    main: 'index.js',
    dependencies: {
      'actions-toolkit': `^${version}`
    }
  }
}

const runCLI = async (argv) => {
  const args = minimist(argv)
  const directoryName = args._[0]
  if (!directoryName || args.help) {
    console.log(`\nUsage: npx actions-toolkit <name>`)
    process.exit(1)
    return
  }
  const base = path.join(process.cwd(), directoryName)
  try {
    console.log(`Creating folder ${base}...`)
    await mkdir(base)
  } catch (err) {
    if (err.code === 'EEXIST') {
      throw new Error(`Folder ${base} already exists!`)
    } else {
      console.error(err.code)
      throw err
    }
  }

  console.log("\nWelcome to actions-toolkit! Let's get started creating an action.")
  const metadata = await getActionMetadata()
  const dockerfile = await createDockerfile(metadata)
  const packageJson = createPackageJson(directoryName)
  const entrypoint = await readFile(path.join(templateDir, 'entrypoint.js'), 'utf8')
  const files = [
    ['package.json', JSON.stringify(packageJson, null, 2)],
    ['Dockerfile', dockerfile],
    ['entrypoint.js', entrypoint]
  ]
  files.forEach(async ([filename, contents]) => {
    console.log(`Creating ${filename}...`)
    await writeFile(path.join(base, filename), contents)
  })

  console.log(`\nDone! Enjoy building your GitHub Action! Get started with:\n\ncd ${directoryName} && npm install`)
}

module.exports = runCLI
