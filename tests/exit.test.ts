import { Exit, FailureCode, NeutralCode, SuccessCode } from '../src/exit'

type methods = 'success' | 'neutral' | 'failure'
type logs = 'log' | 'error'

describe('Exit', () => {
  let logger: any

  beforeEach(() => {
    logger = { error: jest.fn(), log: jest.fn() }
    console = logger

    const p = global.process as any
    p.exit = jest.fn()
  })

  const exit = new Exit()

  const tests = [
    ['success', 'log', SuccessCode],
    ['neutral', 'log', NeutralCode],
    ['failure', 'error', FailureCode]
  ]

  describe.each(tests)('%s', (method, log, code) => {
    it('exits with the expected code', () => {
      exit[method as methods]()
      expect(process.exit).toHaveBeenCalledWith(code)
    })

    it('logs the expected message', () => {
      exit[method as methods]('hello')
      expect(console[log as logs]).toHaveBeenCalledWith('hello')
    })
  })
})
