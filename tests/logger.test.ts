import { CustomSignale, defaultCommands } from '../src/logger'
import * as loggerModule from '../src/logger'

describe('defaultCommands', () => {
  it('should be an array of 2-strings arrays', () => {
    expect(
      defaultCommands.every(
        (e) =>
          e instanceof Array &&
          e.length == 2 &&
          e.every((s) => !!s && typeof s == 'string')
      )
    ).toBeTruthy()
  })
})

describe('CustomSignale', () => {
  const logger = new CustomSignale(),
    spy = jest.spyOn(process.stdout, 'write')

  afterEach(() => {
    spy.mockReset()
  })

  describe('#constructor', () => {
    const original = defaultCommands
    it('should throw when defaultCommands is not valid', () => {
      // eslint-disable-next-line no-import-assign
      Object.defineProperty(loggerModule, 'defaultCommands', {
        value: ['asd', 'asd']
      })
      expect(() => {
        new loggerModule.CustomSignale()
      }).toThrow()
    })
    it('should not throw when defaultCommands is valid', () => {
      // eslint-disable-next-line no-import-assign
      Object.defineProperty(loggerModule, 'defaultCommands', {
        value: original
      })
      expect(() => {
        new CustomSignale()
      }).not.toThrow()
    })
  })

  describe('#startGroup', () => {
    it('should exist in the custom class', () => {
      expect(typeof logger.startGroup).toBe('function')
    })

    it('should issue a "group" command with the correct title', () => {
      logger.startGroup('asd123-')
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith('::group::asd123-\n')
    })
  })

  describe('#endGroup', () => {
    it('should exist in the custom class', () => {
      expect(typeof logger.endGroup).toBe('function')
    })

    it('should issue a "endgroup" command', () => {
      logger.endGroup()
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith('::endgroup::\n')
    })
  })

  describe.each(defaultCommands)('%s -> %s', (key, prefix) => {
    it('should work with a config object', () => {
      logger[key]({ message: 'abc' })
      expect(spy).toHaveBeenCalledTimes(2)
      expect(spy).toHaveBeenNthCalledWith(1, prefix)
      expect(spy).toHaveBeenNthCalledWith(2, expect.stringMatching(/abc\n$/g))
    })

    it('should work with message + parameters', () => {
      logger[key]('abc %s', 'def')
      expect(spy).toHaveBeenCalledTimes(2)
      expect(spy).toHaveBeenNthCalledWith(1, prefix)
      expect(spy).toHaveBeenNthCalledWith(
        2,
        expect.stringMatching(/abc def\n$/g)
      )
    })

    it('should work with just the message', () => {
      logger[key]('abc')
      expect(spy).toHaveBeenCalledTimes(2)
      expect(spy).toHaveBeenNthCalledWith(1, prefix)
      expect(spy).toHaveBeenNthCalledWith(2, expect.stringMatching(/abc\n$/g))
    })

    it('should work with config and no-issue option', () => {
      logger[key]({ message: 'abc', noIssue: true })
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith(
        expect.not.stringMatching(new RegExp(`^${prefix}`, 'g'))
      )
      expect(spy).toHaveBeenLastCalledWith(expect.stringMatching(/abc\n$/g))
    })

    it('should work with message + custom prefix option', () => {
      logger[key]({ message: 'abc', prefix: '123' })
      expect(spy).toHaveBeenCalledTimes(2)
      expect(spy).toHaveBeenNthCalledWith(1, prefix)
      expect(spy).toHaveBeenNthCalledWith(2, expect.stringMatching(/abc\n$/g))
      expect(spy).toHaveBeenNthCalledWith(2, expect.stringMatching(/^123/g))
    })

    it('should work with errors', () => {
      logger[key]({ message: new Error('abc'), noIssue: true })
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith(
        expect.not.stringMatching(new RegExp(`^${prefix}`, 'g'))
      )
      expect(spy).toHaveBeenLastCalledWith(expect.stringContaining('abc'))
    })
  })
})
