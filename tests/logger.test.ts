import { CustomSignale, defaultCommands } from '../src/logger'

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

  describe('#startGroup', () => {
    it('should exist in the custom class', () => {
      expect(typeof logger.startGroup).toBe('function')
    })

    it('should issue a "group" command with the correct title', () => {
      logger.startGroup('asd123-')
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith('::group::asd123-')
    })
  })

  describe('#endGroup', () => {
    it('should exist in the custom class', () => {
      expect(typeof logger.endGroup).toBe('function')
    })

    it('should issue a "endgroup" command', () => {
      logger.endGroup()
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith('::endgroup::')
    })
  })

  describe.each(defaultCommands)('%s -> %s', (key, prefix) => {
    it('should work with one config object', () => {
      logger[key]({ message: 'asd' })
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith(
        expect.stringMatching(new RegExp(`^${prefix}`, 'g'))
      )
    })

    it('should work with message + config object', () => {
      logger[key]('asd', {})
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith(
        expect.stringMatching(new RegExp(`^${prefix}`, 'g'))
      )
    })

    it('should work with just the message', () => {
      logger[key]('asd')
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith(
        expect.stringMatching(new RegExp(`^${prefix}`, 'g'))
      )
    })

    it('should work with config and no-issue option', () => {
      logger[key]({ message: 'asd', noIssue: true })
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith(
        expect.not.stringMatching(new RegExp(`^${prefix}`, 'g'))
      )
    })

    it('should work with message + no-issue option', () => {
      logger[key]('asd', { noIssue: true })
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith(
        expect.not.stringMatching(new RegExp(`^${prefix}`, 'g'))
      )
    })

    it('should work with errors', () => {
      logger[key](new Error('asd'), { noIssue: true })
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith(
        expect.not.stringMatching(new RegExp(`^${prefix}`, 'g'))
      )
    })
  })
})
