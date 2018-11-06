import Toolkit from '../src'

describe('Toolkit', () => {
  let toolkit: Toolkit

  beforeEach(() => {
    toolkit = new Toolkit()
  })

  describe('#createOctokit', () => {
    it('returns an Octokit client', () => {
      const actual = toolkit.createOctokit()
      expect(actual).not.toBe(null)
      expect(actual).toBeInstanceOf(Object)
    })

    it('throws if there is no GITHUB_TOKEN environment variable', () => {
      toolkit.token = ''
      expect(() => toolkit.createOctokit()).toThrowErrorMatchingSnapshot()
    })
  })
})
