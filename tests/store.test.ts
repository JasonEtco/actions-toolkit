import fs from 'fs'
import path from 'path'
import Store from '../src/Store'

describe('Store', () => {
  let store: Store
  const file = path.join(__dirname, 'tmp', 'map.txt')

  beforeEach(() => {
    store = new Store()
  })

  describe('#write', () => {
    it('writes the entries to a file', async () => {
      store.set('foo', true).set('bar', false)
      await store.write(file)
      expect(fs.existsSync(file)).toBe(true)
    })
  })

  afterEach(() => {
    fs.unlinkSync(file)
  })
})
