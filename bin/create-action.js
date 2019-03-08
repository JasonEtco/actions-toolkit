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

/**
 * Reads a template file from disk.
 *
 * @param {string} filename The template filename to read.
 * @returns {Promise<string>} The template file string contents.
 */
const readTemplate = filename => {
  const templateDir = path.join(__dirname, 'template')
  return readFile(path.join(templateDir, filename), 'utf8')
}

/**
 * A predicate function to ensure a string is not empty.
 *
 * @param {string} value The string value.
 * @returns {boolean} Whether the string is empty or not.
 */
const isNotEmpty = value => value.length > 0

/**
 * The options object returned from the CLI questionnaire prompt.
 * @typedef {object} PromptAnswers
 * @property {string} name The action name.
 * @property {string} description The action description.
 * @property {string} icon The feather icon name. See `bin/feather-icons.json` for options.
 * @property {string} color The GitHub Action color. See `bin/colors.json` for options.
 */

/**
 * Prompts the user with a questionnaire to get key metadata for the GitHub Action.
 *
 * @returns {Promise<PromptAnswers>} An object containing prompt answers.
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
 * Creates a Dockerfile contents string, replacing variables in the Dockerfile template
 * with values passed in by the user from the CLI prompt.
 *
 * @param {PromptAnswers} answers The CLI prompt answers.
 * @returns {Promise<string>} The Dockerfile contents.
 */
const createDockerfile = async (answers) => {
  const dockerfileTemplate = await readTemplate('Dockerfile')
  return dockerfileTemplate
    .replace(':NAME', answers.name)
    .replace(':DESCRIPTION', answers.description)
    .replace(':ICON', answers.icon)
    .replace(':COLOR', answers.color)
}

/**
 * Creates a `package.json` object with the latest version
 * of `actions-toolkit` ready to be installed.
 *
 * @param {string} name The action package name.
 * @returns {object} The `package.json` contents.
 */
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

/**
 * Runs the create action CLI prompt and bootstraps a new directory for the user.
 *
 * @public
 * @param {string[]} argv The command line arguments to parse.
 * @returns {Promise<void>} Nothing.
 */
const createAction = async (argv) => {
  const args = minimist(argv)
  const directoryName = args._[0]
  if (!directoryName || args.help) {
    console.log(`\nUsage: npx actions-toolkit <name>`)
    process.exit(1)
    // Although this return is unreachable,
    // for some reason, code after this block is reached in unit tests,
    // even while this calls `process.exit(1)`.
    // Adding a `return` below fixes that issue in the tests.
    // eslint-disable-next-line
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

  console.log("\nWelcome to actions-toolkit! Let's get started creating an action.\n")
  const metadata = await getActionMetadata()
  const dockerfile = await createDockerfile(metadata)
  const packageJson = createPackageJson(directoryName)
  const entrypoint = await readTemplate('entrypoint.js')
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

module.exports = createAction
