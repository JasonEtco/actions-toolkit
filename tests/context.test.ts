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
    it('returns attributes from the GITHUB_REPOSITORY', () => {
      expect(context.repo).toEqual({ owner: 'JasonEtco', repo: 'test' })
    })

    it('returns attributes from the repository payload', () => {
      context.payload.repository = {
        name: 'you',
        owner: { login: 'github' }
      }

      const before = process.env.GITHUB_REPOSITORY
      delete process.env.GITHUB_REPOSITORY
      expect(context.repo).toEqual({ owner: 'github', repo: 'you' })
      process.env.GITHUB_REPOSITORY = before
    })

    it('return error for context.repo when repository doesn\'t exist', () => {
      delete context.payload.repository
      const before = process.env.GITHUB_REPOSITORY
      delete process.env.GITHUB_REPOSITORY
      expect(() => context.repo).toThrowErrorMatchingSnapshot()
      process.env.GITHUB_REPOSITORY = before
    })
  })

  describe('#issue', () => {
    it('returns attributes from the repository payload', () => {
      expect(context.issue).toEqual({ owner: 'JasonEtco', repo: 'test', issue_number: 1 })
    })

    it('works with pull_request payloads', () => {
      context.payload = {
        pull_request: { number: 2 },
        repository: { owner: { login: 'JasonEtco' }, name: 'test' }
      }
      expect(context.issue).toEqual({
        issue_number: 2, owner: 'JasonEtco', repo: 'test'
      })
    })

    it('works with payload.number payloads', () => {
      context.payload = { number: 2, repository: { owner: { login: 'JasonEtco' }, name: 'test' } }
      expect(context.issue).toEqual({
        number: 2, owner: 'JasonEtco', repo: 'test'
      })
    })
  })

  describe('#pullRequest', () => {
    it('returns attributes from the repository payload', () => {
      context.payload = {
        pull_request: { number: 2 },
        repository: { owner: { login: 'JasonEtco' }, name: 'test' }
      }

      expect(context.pullRequest).toEqual({
        owner: 'JasonEtco',
        repo: 'test',
        pull_number: 2
      })
    })

    it('throws if no pull_request object was found', () => {
      context.payload = {
        repository: { owner: { login: 'JasonEtco' }, name: 'test' }
      }

      expect(() => context.pullRequest).toThrow()
    })
  })
})
