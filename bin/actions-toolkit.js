#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const minimist = require('minimist')
const { prompt } = require('enquirer')
const { render } = require('mustache')
const colors = require('./colors.json')
const icons = require('./feather-icons.json')

const readFile = promisify(fs.readFile)
const mkdir = promisify(fs.mkdir)
const readdir = promisify(fs.readdir)
const writeFile = promisify(fs.writeFile)

const templateDir = path.join(__dirname, 'template')

/** A predicate function to ensure a string is not empty. */
const isNotEmpty = value => value.length > 0

const getActionMetadata = () => prompt([
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
]).catch(() => {
  // When prompt() rejects, that means the user has pressed ctrl+c to cancel input.
  // The idea here is to create a "cancel error" that can be rethrown
  // and caught by the main CLI runner, which can print an error message.
  const error = new Error()
  error.code = 'ECANCEL'
  throw error
})

const createDockerfile = async ({ name, description, icon, color }) => {
  const dockerfileTemplate = await readFile(path.join(templateDir, 'Dockerfile'), 'utf8')
  return render(dockerfileTemplate, { name, description, icon, color })
}

const main = async () => {
  const args = minimist(process.argv.slice(2))
  const directoryName = args._[0]
  if (!directoryName || args.help) {
    console.log(`\nUsage: npx actions-toolkit <name>`)
    process.exit(1)
  }
  // todo: check if directoryName exists and cancel if it does
  console.log()
  console.log("Welcome to actions-toolkit! Let's get started creating an action.")
  const metadata = await getActionMetadata()
  const dockerfile = await createDockerfile(metadata)
  // todo: write Dockerfile, package.json, and entrypoint.js to disk.
}

const name = process.argv[2]

if (!name) {
  console.log(`\nUsage: npx actions-toolkit <name>`)
  process.exit(1)
}
const base = path.join(process.cwd(), name)

try {
  console.log(`Creating folder ${base}...`)
  fs.mkdirSync(base)
} catch (err) {
  if (err.code === 'EEXIST') {
    console.error(`Folder ${base} already exists!`)
  } else {
    console.error(err.code)
  }
  process.exit(1)
}

const { version } = require('../package.json')
const packageJson = {
  name,
  private: true,
  main: 'index.js',
  dependencies: {
    'actions-toolkit': `^${version}`
  }
}

console.log('Creating package.json...')
fs.writeFileSync(path.join(base, 'package.json'), JSON.stringify(packageJson, null, 2))

fs.readdirSync(templateDir).forEach(file => {
  const contents = fs.readFileSync(path.join(templateDir, file))
  console.log(`Creating ${file}...`)
  fs.writeFileSync(path.join(base, file), contents)
})

console.log(`\nDone! Enjoy building your GitHub Action! Get started with:\n\ncd ${name} && npm install`)
