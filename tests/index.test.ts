import nock from 'nock'
import path from 'path'
import { Signale } from 'signale'
import { Toolkit } from '../src'
import { NeutralCode } from '../src/exit'

describe('Toolkit', () => {
  let toolkit: Toolkit

  beforeEach(() => {
    toolkit = new Toolkit({ logger: new Signale({ disabled: true }) })
  })

  describe('#github', () => {
    it('returns a GitHub client', () => {
      expect(toolkit.github).toBeInstanceOf(Object)
    })

    it('returns a GraphQL function on `.graphql`', async () => {
      expect(toolkit.github.graphql).toBeInstanceOf(Function)

      const scoped = nock('https://api.github.com')
        .post('/graphql').reply(200, { data: { errors: [] } })

      await toolkit.github.graphql('query { }')
      expect(scoped.isDone()).toBe(true)
    })
  })

  describe('#getFile', () => {
    it('gets the contents of a file', () => {
      const actual = toolkit.getFile('README.md')
      expect(actual).toMatchSnapshot()
    })

    it('gets the contents of a file with custom encoding', () => {
      const actual = toolkit.getFile('README.md', 'base64')
      expect(actual).toMatchSnapshot()
    })

    it('throws if the file could not be found', () => {
      const actual = () => toolkit.getFile('DONTREADME.md')
      expect(actual).toThrowErrorMatchingSnapshot()
    })
  })

  describe('#getPackageJSON', () => {
    it('returns the package.json file as a JSON object', () => {
      const actual = toolkit.getPackageJSON()
      expect(actual).toMatchSnapshot()
    })

    it('throws if the package.json file could not be found', () => {
      toolkit.workspace = path.join(__dirname, 'fixtures', 'workspaces', 'no-package-json')
      const actual = () => toolkit.getPackageJSON()
      expect(actual).toThrowErrorMatchingSnapshot()
    })
  })

  describe('#config', () => {
    it('returns a property in the package.json', () => {
      const actual = toolkit.config('action')
      expect(actual).toEqual({ foo: true })
    })

    it('returns a parsed YAML file', () => {
      const actual = toolkit.config('action.yml')
      expect(actual).toEqual({ foo: true })
    })

    it('returns a .rc file as JSON', () => {
      const actual = toolkit.config('.actionrc')
      expect(actual).toEqual({ foo: true })
    })
  })

  describe('#runInWorkspace', () => {
    it('runs the command in the workspace', async () => {
      const result = await toolkit.runInWorkspace('echo', 'hello')
      expect(result).toMatchSnapshot()
      expect(result.stdout).toBe('hello')
    })

    it('runs the command in the workspace with some options', async () => {
      const result = await toolkit.runInWorkspace('throw', undefined, { reject: false })
      expect(result).toMatchSnapshot()
    })
  })

  describe('#wrapLogger', () => {
    it('wraps the provided logger and allows for a callable class', () => {
      const logger = new Signale() as jest.Mocked<Signale>
      logger.info = jest.fn()
      const twolkit = new Toolkit({ logger })

      twolkit.log('Hello!')
      twolkit.log.info('Hi!')

      expect(logger.info).toHaveBeenCalledTimes(2)
      expect(logger.info).toHaveBeenCalledWith('Hello!')
      expect(logger.info).toHaveBeenCalledWith('Hi!')
    })
  })
})

describe('Toolkit#constructor', () => {
  let logger: jest.Mocked<Signale>
  let exit: (code?: number) => never

  beforeEach(() => {
    logger = new Signale() as jest.Mocked<Signale>
    logger.error = jest.fn()
    logger.warn = jest.fn()

    exit = global.process.exit
    const p = global.process as any
    p.exit = jest.fn()
  })

  it('exits if the event is not allowed with an array of events', () => {
    // tslint:disable-next-line:no-unused-expression
    new Toolkit({ logger, event: ['pull_request'] })
    expect(process.exit).toHaveBeenCalledWith(NeutralCode)
    expect(logger.error.mock.calls).toMatchSnapshot()
  })

  it('does not exit if the event is one of the allowed with an array of events', () => {
    // tslint:disable-next-line:no-unused-expression
    new Toolkit({ logger, event: ['pull_request', 'issues'] })
    expect(process.exit).not.toHaveBeenCalled()
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('exits if the event is not allowed with a single event', () => {
    // tslint:disable-next-line:no-unused-expression
    new Toolkit({ logger, event: 'pull_request' })
    expect(process.exit).toHaveBeenCalledWith(NeutralCode)
    expect(logger.error.mock.calls).toMatchSnapshot()
  })

  it('exits if the event is not allowed with an array of events with actions', () => {
    // tslint:disable-next-line:no-unused-expression
    new Toolkit({ logger, event: ['pull_request.opened'] })
    expect(process.exit).toHaveBeenCalledWith(NeutralCode)
    expect(logger.error.mock.calls).toMatchSnapshot()
  })

  it('exits if the event is not allowed with a single event with an action', () => {
    // tslint:disable-next-line:no-unused-expression
    new Toolkit({ logger, event: 'pull_request.opened' })
    expect(process.exit).toHaveBeenCalledWith(NeutralCode)
    expect(logger.error.mock.calls).toMatchSnapshot()
  })

  it('logs the expected string with missing env vars', () => {
    delete process.env.HOME
    new Toolkit({ logger }) // tslint:disable-line:no-unused-expression
    expect(logger.warn.mock.calls).toMatchSnapshot()
  })

  it('sets a named logger', () => {
    const tools = new Toolkit({ logger }) // tslint:disable-line:no-unused-expression
    const fooLogger = {
      success: jest.fn().mockImplementation(tools.createScopedLogger('foo').success)
    }
    fooLogger.success('hi there from foo logger')
    expect(fooLogger.success.mock.calls).toMatchSnapshot()
  })

  afterEach(() => {
    global.process.exit = exit
  })
})
