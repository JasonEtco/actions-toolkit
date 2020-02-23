import nock from 'nock'
import path from 'path'
import { Signale } from 'signale'
import { Toolkit } from '../src'
import { NeutralCode } from '../src/exit'

describe('Toolkit', () => {
  let toolkit: Toolkit

  beforeEach(() => {
    // Mock the `process` event emitter to prevent memory
    // leaks on repeated calls in tests - used by Store.
    process.on = jest.fn()
    toolkit = new Toolkit({ logger: new Signale({ disabled: true }) })
  })

  describe('.run', () => {
    it('runs the async function passed to it', async () => {
      const spy = jest.fn(() => Promise.resolve('hi'))
      const actual = await Toolkit.run(spy, { logger: new Signale({ disabled: true }) })
      // Test that the function was called
      expect(spy).toHaveBeenCalled()
      // Make sure it was called with a Toolkit instance
      expect((spy.mock.calls as any)[0][0]).toBeInstanceOf(Toolkit)
      // Check that it returned a value as an async function
      expect(actual).toBe('hi')
    })

    it('runs a non-async function passed to it', async () => {
      const spy = jest.fn(() => 'hi')
      const actual = await Toolkit.run(spy, { logger: new Signale({ disabled: true }) })
      // Check that it returned a value as an async function
      expect(actual).toBe('hi')
    })

    it('logs and fails when the function throws an error', async () => {
      const err = new Error('Whoops!')
      const exitFailure = jest.fn()

      await Toolkit.run(async twolkit => {
        twolkit.exit.failure = exitFailure
        throw err
      }, { logger: new Signale({ disabled: true }) })

      expect(exitFailure).toHaveBeenCalledTimes(1)
    })
  })

  describe('#inputs', () => {
    beforeEach(() => {
      process.env.INPUT_EXAMPLE = 'pizza'
    })
  
    afterEach(() => {
      delete process.env.INPUT_EXAMPLE
    })
  
    it('returns the expected value', () => {
      const result = toolkit.inputs.example
      expect(result).toBe('pizza')
    })
  
    it('accepts the correct types', () => {
      const twolkit = new Toolkit<{ example: string }>()
      const result = twolkit.inputs.example
      expect(result).toBe('pizza')
    })
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

  describe('#command', () => {
    let spy: jest.Mock<any, any>

    beforeEach(() => {
      spy = jest.fn()
    })

    it('calls the handler without any args', async () => {
      toolkit.context.payload.comment = { body: '/action' }
      await toolkit.command('action', spy)
      expect(spy).toHaveBeenCalled()
    })

    it('ignores commands not at the beginning of the line', async () => {
      toolkit.context.payload.comment = { body: 'Hello /action' }
      await toolkit.command('action', spy)
      expect(spy).not.toHaveBeenCalled()
    })

    it('only matches the exact command', async () => {
      toolkit.context.payload.comment = { body: '/actionssssssssss' }
      await toolkit.command('action', spy)
      expect(spy).not.toHaveBeenCalled()
    })

    it('calls the handler with a command at the beginning of a line that is not the first line', async () => {
      toolkit.context.payload.comment = { body: 'Hello\n/action' }
      await toolkit.command('action', spy)
      expect(spy).toHaveBeenCalled()
    })

    it('calls the handler with parsed args', async () => {
      toolkit.context.payload.comment = { body: '/action testing another --file index.js' }
      await toolkit.command('action', spy)
      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledWith({
        _: ['testing', 'another'],
        file: 'index.js'
      }, expect.arrayContaining([
        '/action testing another --file index.js',
        'testing another --file index.js'
      ]))
    })

    it('does not call the handler if the body does not contain the command', async () => {
      toolkit.context.payload.comment = { body: 'Hello how are you' }
      await toolkit.command('action', spy)
      expect(spy).not.toHaveBeenCalled()
    })

    it('does not call the handler if no body is found', async () => {
      await toolkit.command('action', spy)
      expect(spy).not.toHaveBeenCalled()
    })

    it('calls the handler multiple times for multiple matches', async () => {
      toolkit.context.payload.comment = { body: '/action\n/action testing\n/action' }
      await toolkit.command('action', spy)
      expect(spy).toHaveBeenCalledTimes(3)
    })

    it('does not call the handler if the sender was a bot', async () => {
      toolkit.context.payload.comment = { body: '/action' }
      toolkit.context.payload.sender = { type: 'Bot' }
      await toolkit.command('action', spy)
      expect(spy).not.toHaveBeenCalled()
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
      const logger = new Signale({ disabled: true }) as jest.Mocked<Signale>
      logger.info = jest.fn()
      const twolkit = new Toolkit({ logger })

      twolkit.log('Hello!')
      twolkit.log.info('Hi!')

      expect(logger.info).toHaveBeenCalledTimes(2)
      expect(logger.info).toHaveBeenCalledWith('Hello!')
      expect(logger.info).toHaveBeenCalledWith('Hi!')

      // Ensure that prototype methods were carried over
      expect(twolkit.log.disable).toBeInstanceOf(Function)
      expect(twolkit.log.disable).toEqual(logger.disable)
    })
  })
})

describe('Toolkit#constructor', () => {
  let logger: jest.Mocked<Signale>
  let exit: (code?: number) => never

  beforeEach(() => {
    logger = new Signale({ disabled: true }) as jest.Mocked<Signale>
    logger.error = jest.fn()
    logger.warn = jest.fn()

    exit = global.process.exit
    const p = global.process as any
    p.exit = jest.fn()
  })

  describe('missing env vars', () => {
    it('logs the expected string with missing env vars', () => {
      delete process.env.HOME
      new Toolkit({ logger })
      expect(logger.warn.mock.calls).toMatchSnapshot()
    })
  })

  describe('events', () => {
    it('exits if the event is not allowed with an array of events', () => {
      new Toolkit({ logger, event: ['pull_request'] })
      expect(process.exit).toHaveBeenCalledWith(NeutralCode)
      expect(logger.error.mock.calls).toMatchSnapshot()
    })

    it('does not exit if the event is one of the allowed with an array of events', () => {
      new Toolkit({ logger, event: ['pull_request', 'issues'] })
      expect(process.exit).not.toHaveBeenCalled()
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('exits if the event is not allowed with a single event', () => {
      new Toolkit({ logger, event: 'pull_request' })
      expect(process.exit).toHaveBeenCalledWith(NeutralCode)
      expect(logger.error.mock.calls).toMatchSnapshot()
    })

    it('exits if the event is not allowed with an array of events with actions', () => {
      new Toolkit({ logger, event: ['pull_request.opened'] })
      expect(process.exit).toHaveBeenCalledWith(NeutralCode)
      expect(logger.error.mock.calls).toMatchSnapshot()
    })

    it('exits if the event is not allowed with a single event with an action', () => {
      new Toolkit({ logger, event: 'pull_request.opened' })
      expect(process.exit).toHaveBeenCalledWith(NeutralCode)
      expect(logger.error.mock.calls).toMatchSnapshot()
    })
  })

  describe('secrets', () => {
    it('does nothing when passed an empty array', () => {
      logger.fatal = jest.fn()
      new Toolkit({ logger, secrets: [] })
      expect(logger.fatal).not.toHaveBeenCalled()
    })

    it('does nothing when no required secrets are missing', () => {
      process.env.I_EXIST = 'boo'
      logger.fatal = jest.fn()
      new Toolkit({ logger, secrets: ['I_EXIST'] })
      expect(logger.fatal).not.toHaveBeenCalled()
    })

    it('calls the exit.failure with missing secrets', () => {
      // Delete this, juuuust in case
      delete process.env.DO_NOT_EXIST

      logger.fatal = jest.fn()
      new Toolkit({ logger, secrets: ['DO_NOT_EXIST'] })
      expect(logger.fatal).toHaveBeenCalled()
      expect(logger.fatal.mock.calls).toMatchSnapshot()
    })
  })

  // tslint:enable:no-unused-expression
  afterEach(() => {
    global.process.exit = exit
  })
})
