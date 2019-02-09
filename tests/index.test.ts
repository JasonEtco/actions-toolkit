import nock from 'nock'
import path from 'path'
import { Toolkit } from '../src'

describe('Toolkit', () => {
  let toolkit: Toolkit
  let logger: any

  beforeEach(() => {
    toolkit = new Toolkit()
    logger = console as any
    logger = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn()
    }
    console = logger
  })

  describe('#constructor', () => {
    let exit: (code?: number) => never

    beforeEach(() => {
      exit = global.process.exit
      const p = global.process as any
      p.exit = jest.fn()
    })

    it('exits if the event is not allowed with an array of eventts', () => {
      // tslint:disable-next-line:no-unused-expression
      new Toolkit({ event: ['issues'] })
      expect(process.exit).toHaveBeenCalledWith(1)
    })

    it('exits if the event is not allowed', () => {
      // tslint:disable-next-line:no-unused-expression
      new Toolkit({ event: 'issues' })
      expect(process.exit).toHaveBeenCalledWith(1)
    })

    it('logs the expected string with missing env vars', () => {
      logger.warn = jest.fn()

      delete process.env.HOME
      // Toolkit, but number two. Ergo, twolkit. Open an issue if this isn't clear.
      new Toolkit() // tslint:disable-line:no-unused-expression
      expect(logger.warn.mock.calls).toMatchSnapshot()
    })

    afterEach(() => {
      global.process.exit = exit
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
})
