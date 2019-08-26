const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const minimist = require('minimist')
const { Signale } = require('signale')
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
async function readTemplate (filename) {
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
async function getActionMetadata () {
  return prompt([
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
      choices: icons,
      limit: 10
    },
    {
      type: 'autocomplete',
      name: 'color',
      message: 'Choose a background color background color used in the visual workflow editor for your action.',
      choices: colors
    }
  ])
}

/**
 * Creates a Dockerfile contents string, replacing variables in the Dockerfile template
 * with values passed in by the user from the CLI prompt.
 *
 * @param {PromptAnswers} answers The CLI prompt answers.
 * @returns {Promise<string>} The Dockerfile contents.
 */
async function createDockerfile (answers) {
  const dockerfileTemplate = await readTemplate('Dockerfile')
  return dockerfileTemplate
    .replace(':NAME', answers.name)
    .replace(':DESCRIPTION', answers.description)
    .replace(':ICON', answers.icon)
    .replace(':COLOR', answers.color)
}

/**
 * Creates a action.yml contents string, replacing variables in the action.yml template
 * with values passed in by the user from the CLI prompt.
 *
 * @param {PromptAnswers} answers The CLI prompt answers.
 * @returns {Promise<string>} The action.yml contents.
 */
async function createActionYaml (answers) {
  const template = await readTemplate('action.yml')
  return template
    .replace(':NAME', answers.name)
    .replace(':DESCRIPTION', answers.description)
    .replace(':ICON', answers.icon)
    .replace(':COLOR', answers.color)
}

/**
 * Creates an index.test.js contents string, replacing variables in the index.test.js template
 * with values passed in by the user from the CLI prompt.
 *
 * @param {PromptAnswers} answers The CLI prompt answers.
 * @returns {Promise<string>} The index.test.js contents.
 */
async function createIndexTest (answers) {
  const indexTest = await readTemplate('index.test.js')
  return indexTest
    .replace(':NAME', answers.name)
}

/**
 * Creates a `package.json` object with the latest version
 * of `actions-toolkit` ready to be installed.
 *
 * @param {string} name The action package name.
 * @returns {object} The `package.json` contents.
 */
function createPackageJson (name) {
  const { version, devDependencies } = require('../package.json')
  return {
    name,
    private: true,
    main: 'index.js',
    scripts: {
      start: 'node ./index.js',
      test: 'jest'
    },
    dependencies: {
      'actions-toolkit': `^${version}`
    },
    devDependencies: {
      jest: devDependencies.jest
    }
  }
}

/**
 * Runs the create action CLI prompt and bootstraps a new directory for the user.
 *
 * @public
 * @param {string[]} argv The command line arguments to parse.
 * @param {import("signale").Signale} [logger] The Signale logger.
 * @returns {Promise<void>} Nothing.
 */
module.exports = async function createAction (argv, signale = new Signale({
  config: {
    displayLabel: false
  }
})) {
  const args = minimist(argv)
  const directoryName = args._[0]
  if (!directoryName || args.help) {
    signale.log('\nUsage: npx actions-toolkit <name>')
    return process.exit(1)
  }

  signale.star('Welcome to actions-toolkit! Let\'s get started creating an action.\n')

  const base = path.join(process.cwd(), directoryName)
  try {
    signale.info(`Creating folder ${base}...`)
    await mkdir(base)
  } catch (err) {
    if (err.code === 'EEXIST') {
      signale.fatal(`Folder ${base} already exists!`)
    }
    throw err
  }

  // Collect answers
  const metadata = await getActionMetadata()

  signale.log('\n------------------------------------\n')

  // Create the templated files
  const actionYaml = await createActionYaml(metadata)
  const dockerfile = await createDockerfile(metadata)
  const indexTest = await createIndexTest(metadata)
  const packageJson = createPackageJson(directoryName)
  const entrypoint = await readTemplate('index.js')

  await Promise.all([
    ['package.json', JSON.stringify(packageJson, null, 2)],
    ['Dockerfile', dockerfile],
    ['action.yml', actionYaml],
    ['index.js', entrypoint],
    ['index.test.js', indexTest]
  ].map(async ([filename, contents]) => {
    signale.info(`Creating ${filename}...`)
    await writeFile(path.join(base, filename), contents)
  }))

  signale.log('\n------------------------------------\n')
  signale.success(`Done! Enjoy building your GitHub Action!`)
  signale.info(`Get started with:\n\ncd ${directoryName} && npm install`)
}
