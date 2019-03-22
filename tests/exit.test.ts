import { Signale } from 'signale'
import { Exit, FailureCode, NeutralCode, SuccessCode } from '../src/exit'

// Need to type these to properly iterate
enum methods {
  Success = 'success',
  Neutral = 'neutral',
  Failure = 'failure'
}

// Methods on the logging class
type logs = keyof(Signale)

describe('Exit', () => {
  const tests = [
    ['success', 'success', SuccessCode],
    ['neutral', 'info', NeutralCode],
    ['failure', 'fatal', FailureCode]
  ]

  describe.each(tests)('%s', (method, log, code) => {
    let logger: Signale
    let exit: Exit

    beforeEach(() => {
      // Create a logger to mock
      logger = new Signale()
      logger.success = jest.fn()
      logger.info = jest.fn()
      logger.fatal = jest.fn()

      const p = global.process as any
      p.exit = jest.fn()
      exit = new Exit(logger)
    })

    it('exits with the expected code', () => {
      exit[method as methods]()
      expect(process.exit).toHaveBeenCalledWith(code)
    })

    it('logs the expected message', () => {
      exit[method as methods]('hello')
      expect(logger[log as logs]).toHaveBeenCalledWith('hello')
    })
  })
})
