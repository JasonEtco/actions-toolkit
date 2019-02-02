import { Cache, load } from 'flat-cache'
import path from 'path'

export class Store {
  public file: string

  /**
   * Get a value from the store by it's key
   */
  public get: Cache['getKey']

  /**
   * Set a key/value pair in the store
   */
  public set: Cache['setKey']

  /**
   * Return all key/values in the store as a JSON object
   */
  public all: Cache['all']

  /**
   * Delete a key from the store
   */
  public del: Cache['removeKey']

  /**
   * Save the in-memory store to a file
   */
  public save: Cache['save']

  /**
   * Instance of flat-cache
   */
  private cache: Cache

  constructor (workflow: string, workspace: string) {
    this.file = `.${workflow}-cache`
    this.cache = load(this.file, path.resolve(workspace))

    this.get = this.cache.getKey.bind(this.cache)
    this.set = this.cache.setKey.bind(this.cache)
    this.all = this.cache.all.bind(this.cache)
    this.del = this.cache.removeKey.bind(this.cache)
    this.save = this.cache.save.bind(this.cache, true)

    process.on('exit', () => {
      this.save()
    })
  }
}
