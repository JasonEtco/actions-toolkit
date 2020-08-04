import { Signale } from 'signale'
import { Exit, FailureCode } from '../src/exit'
import { Assert } from '../src/assert'

describe('Assert', () => {

  let logger: Signale
  let exit: Exit
  let assert: Assert

  beforeEach(() => {
    // Create a logger to mock
    logger = new Signale()
    logger.success = jest.fn()
    logger.info = jest.fn()
    logger.fatal = jest.fn()

    const p = global.process as any
    p.exit = jest.fn()
    exit = new Exit(logger)
    assert = new Assert(exit);
  })

  describe('.isTruthy', () => {
    it('do nothing on truthy condition', () => {
      assert.isTruthy(true)
      expect(process.exit).not.toHaveBeenCalled()
      expect(logger.success).not.toHaveBeenCalled()
      expect(logger.info).not.toHaveBeenCalled()
      expect(logger.fatal).not.toHaveBeenCalled()
    })

    it('exits on falsy condition', () => {
      assert.isTruthy(false)
      expect(process.exit).toHaveBeenCalledTimes(1)
      expect(process.exit).toHaveBeenCalledWith(FailureCode)
    })

    it('logs the default message', () => {
      assert.isTruthy(false)
      expect(logger.fatal).toHaveBeenCalledTimes(1)
    })

    it('logs the expected message', () => {
      assert.isTruthy(false, 'hello')
      expect(logger.fatal).toHaveBeenCalledTimes(1)
      expect(logger.fatal).toHaveBeenCalledWith('hello')
    })
  })
})
