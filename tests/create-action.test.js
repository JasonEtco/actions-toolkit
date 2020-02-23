/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')

jest.mock('enquirer')

// Remove double quotes around snapshots.
// This improves snapshot readability for generated file contents.
expect.addSnapshotSerializer({
  test: value => typeof value === 'string',
  print: value => value
})

/** Creates a mock Signale logger instance for use in asserting log function calls. */
const createLogger = () => ({
  log: jest.fn(),
  info: jest.fn(),
  fatal: jest.fn(),
  star: jest.fn(),
  success: jest.fn()
})

let logger

beforeEach(() => {
  jest.resetModules()

  process.exit = jest.fn()
  logger = createLogger()

  // Create temporary directory for writing CLI test output.
  fs.mkdirSync(path.resolve(__dirname, '../__tmp'))
})

afterEach(() => {
  jest.restoreAllMocks()

  // Remove temporary directory where CLI test output may have been written.
  rimraf.sync(path.resolve(__dirname, '../__tmp'))
})

const runCLI = (...args) => {
  const createAction = require('../bin/create-action')
  return createAction(args, logger)
}

test('prints help when no arguments are passed', async () => {
  await runCLI()

  expect(process.exit).toHaveBeenCalledWith(1)
  expect(logger.log).toHaveBeenCalledWith(
    expect.stringMatching(/Usage: npx actions-toolkit <name>/)
  )
})

test('prints help when --help is passed', async () => {
  await runCLI('--help')

  expect(process.exit).toHaveBeenCalledWith(1)
  expect(logger.log).toHaveBeenCalledWith(
    expect.stringMatching(/Usage: npx actions-toolkit <name>/)
  )
})

test('fails to start creating project in a directory that already exists', async () => {
  await expect(runCLI('tests/fixtures/workspaces/action-already-exists')).rejects.toThrowError()
  expect(logger.fatal).toHaveBeenCalledWith(
    expect.stringMatching(/Folder .*tests\/fixtures\/workspaces\/action-already-exists already exists!/)
  )
})

test('exits with a failure message when a user cancels the questionnaire', async () => {
  // Mock enquirer to throw an error as if a user presses ctrl+c to cancel the questionnaire.
  const mockEnquirer = require('enquirer')
  mockEnquirer.prompt.mockImplementationOnce(() => {
    throw new Error()
  })

  await expect(runCLI('__tmp/my-project-name')).rejects.toThrowError()
})

test('creates project with labels passed to Dockerfile from questionnaire', async () => {
  jest.mock('../package.json', () => ({
    version: '1.0.0-static-version-for-test',
    devDependencies: {
      jest: '1.0.0-static-version-for-test'
    }
  }))

  require('enquirer').__setAnswers({
    name: 'My Project Name',
    description: 'A cool project',
    icon: 'anchor',
    color: 'blue'
  })

  const readGeneratedFile = name =>
    fs.readFileSync(path.resolve(__dirname, '../__tmp/my-project-name', name), 'utf-8')

  await runCLI('__tmp/my-project-name')

  expect(logger.info).toHaveBeenCalledWith(
    expect.stringMatching(/Creating folder .*my-project-name.../)
  )
  expect(logger.star).toHaveBeenCalledWith(
    expect.stringMatching(/Welcome to actions-toolkit/)
  )
  expect(logger.info).toHaveBeenCalledWith(
    expect.stringMatching(/Creating package.json/)
  )
  expect(logger.info).toHaveBeenCalledWith(
    expect.stringMatching(/Creating Dockerfile/)
  )
  expect(logger.info).toHaveBeenCalledWith(
    expect.stringMatching(/Creating index.js/)
  )
  expect(logger.info).toHaveBeenCalledWith(
    expect.stringMatching(/Creating index.test.js/)
  )
  expect(readGeneratedFile('package.json')).toMatchSnapshot('package.json')
  expect(readGeneratedFile('Dockerfile')).toMatchSnapshot('Dockerfile')
  expect(readGeneratedFile('index.js')).toMatchSnapshot('index.js')
  expect(readGeneratedFile('index.test.js')).toMatchSnapshot('index.test.js')
})
