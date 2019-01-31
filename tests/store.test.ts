import fs from 'fs'
import path from 'path'
import Store from '../src/Store'

describe('Store', () => {
  const file = path.join(__dirname, 'tmp', 'map.txt')

  describe('#load', () => {
    it('loads a new map from a file', async () => {
      const store = new Store(path.join(__dirname, 'fixtures', 'map.txt'))
      expect(store).toBeInstanceOf(Store)
      expect(store).toMatchSnapshot()
    })

    it('does not load a new map from a file if the file does not exist', async () => {
      const store = new Store(path.join(__dirname, 'fixtures', 'nope.txt'))
      expect(store).toBeInstanceOf(Store)
      expect(store).toMatchSnapshot()
    })
  })

  describe('#write', () => {
    it('writes the entries to a file', async () => {
      const store = new Store()
      store.set('foo', true).set('bar', false)
      await store.write(file)
      expect(fs.existsSync(file)).toBe(true)
      expect(fs.readFileSync(file, 'utf8')).toMatchSnapshot()
    })

    afterEach(() => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file)
      }
    })
  })
})
