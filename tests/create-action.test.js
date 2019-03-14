// Remove double quotes around snapshots.
// This improves snapshot readability for generated file contents.
expect.addSnapshotSerializer({
  test: value => typeof value === 'string',
  print: value => value
})

jest.mock('fs')
jest.mock('enquirer')

let mockFs

const runCLI = (...args) => {
  const createAction = require('../bin/create-action')
  return createAction(args)
}

beforeEach(() => {
  jest.resetModules()
  mockFs = require('fs')

  process.exit = jest.fn()
  console.log = jest.fn()
  console.error = jest.fn()
  process.cwd = jest.fn(() => '.')
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('prints help when no arguments are passed', async () => {
  await runCLI()

  expect(process.exit).toHaveBeenCalledWith(1)
  expect(console.log).toHaveBeenCalledWith(
    expect.stringMatching(/Usage: npx actions-toolkit <name>/)
  )
})

test('prints help when --help is passed', async () => {
  await runCLI('--help')

  expect(process.exit).toHaveBeenCalledWith(1)
  expect(console.log).toHaveBeenCalledWith(
    expect.stringMatching(/Usage: npx actions-toolkit <name>/)
  )
})

test('fails to start creating project in a directory that already exists', async () => {
  mockFs.mkdir.mockImplementationOnce((_, cb) => {
    const error = new Error()
    error.code = 'EEXIST'
    cb(error)
  })

  await expect(runCLI('my-project-name')).rejects.toThrowError(
    /Folder my-project-name already exists!/
  )
})

test('throws unhandled fs.mkdir errors', async () => {
  mockFs.mkdir.mockImplementationOnce((_, cb) => {
    const error = new Error("EPERM: operation not permitted, mkdir '/etc'")
    error.code = 'EPERM'
    cb(error)
  })

  await expect(runCLI('my-project-name')).rejects.toThrowError(/EPERM: operation not permitted, mkdir '\/etc'/)
})

test('exits with a failure message when a user cancels the questionnaire', async () => {
  // Mock enquirer to throw an error as if a user presses ctrl+c to cancel the questionnaire.
  const mockEnquirer = require('enquirer')
  mockEnquirer.prompt.mockImplementationOnce(() => {
    throw new Error()
  })

  await expect(runCLI('my-project-name')).rejects.toThrowError()
})

test('creates project with labels passed to Dockerfile from questionnaire', async () => {
  jest.mock('../package.json', () => ({ version: '1.0.0-static-version-for-test' }))
  require('enquirer').__setAnswers({
    name: 'My Project Name',
    description: 'A cool project',
    icon: 'anchor',
    color: 'blue'
  })
  mockFs.mkdir.mockImplementationOnce((_, cb) => cb(null))

  await runCLI('my-project-name')

  expect(console.log).toHaveBeenCalledWith(
    expect.stringMatching(/Creating folder my-project-name.../)
  )
  expect(console.log).toHaveBeenCalledWith(
    expect.stringMatching(/Welcome to actions-toolkit/)
  )
  expect(console.log).toHaveBeenCalledWith(
    expect.stringMatching(/Creating package.json/)
  )
  expect(console.log).toHaveBeenCalledWith(
    expect.stringMatching(/Creating Dockerfile/)
  )
  expect(console.log).toHaveBeenCalledWith(
    expect.stringMatching(/Creating entrypoint.js/)
  )
  expect(mockFs.__getContents('my-project-name/package.json')).toMatchSnapshot('package.json')
  expect(mockFs.__getContents('my-project-name/Dockerfile')).toMatchSnapshot('Dockerfile')
  expect(mockFs.__getContents('my-project-name/entrypoint.js')).toMatchSnapshot('entrypoint.js')
})
