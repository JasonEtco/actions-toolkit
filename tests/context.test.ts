import { Context } from '../src/context'

describe('Context', () => {
  let context: Context

  beforeEach(() => {
    context = new Context()
  })

  describe('.payload', () => {
    it('returns the payload object', () => {
      expect(context.payload).toMatchSnapshot()
    })

    it('returns an empty object if the GITHUB_EVENT_PATH environment variable is falsey', () => {
      // Have to store the env var to pass later tests
      const before = process.env.GITHUB_EVENT_PATH
      delete process.env.GITHUB_EVENT_PATH

      context = new Context()
      expect(context.payload).toEqual({})

      // Reset it
      process.env.GITHUB_EVENT_PATH = before
    })
  })

  describe('#repo', () => {
    it('returns attributes from repository payload', () => {
      expect(context.repo).toEqual({ owner: 'JasonEtco', repo: 'test' })
    })

    it('return error for context.repo when repository doesn\'t exist', () => {
      context.payload = {}
      try {
        // tslint:disable-next-line no-unused-expression
        context.repo
      } catch (e) {
        expect(e.message).toMatch('context.repo is not supported')
      }
    })
  })

  describe('#issue', () => {
    it('returns attributes from the repository payload', () => {
      expect(context.issue).toEqual({ owner: 'JasonEtco', repo: 'test', number: 1 })
    })

    it('works with pull_request payloads', () => {
      context.payload = {
        pull_request: { number: 2 },
        repository: { owner: { login: 'JasonEtco' }, name: 'test' }
      }
      expect(context.issue).toEqual({
        number: 2, owner: 'JasonEtco', repo: 'test'
      })
    })

    it('works with payload.number payloads', () => {
      context.payload = { number: 2, repository: { owner: { login: 'JasonEtco' }, name: 'test' } }
      expect(context.issue).toEqual({
        number: 2, owner: 'JasonEtco', repo: 'test'
      })
    })
  })
})
