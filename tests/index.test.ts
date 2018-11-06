import path from 'path'
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

  describe('#getFile', () => {
    it('gets the contents of a file', () => {
      const actual = toolkit.getFile('README.md')
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
})
