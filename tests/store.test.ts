import fs from 'fs'
import path from 'path'
import { Store } from '../src/store'

describe('Store', () => {
  let store: Store

  beforeEach(() => {
    const workflow = process.env.GITHUB_WORKFLOW as string
    const workspace = process.env.GITHUB_WORKSPACE as string
    store = new Store(workflow, workspace)
  })

  it('calls .save() on process exit', () => {
    store.save = jest.fn()
    process.emit('exit' as 'disconnect')
    expect(store.save).toHaveBeenCalled()
  })

  it('actually saves on process exit', () => {
    store.set('foo', 'bar')
    process.emit('exit' as 'disconnect')
    expect(
      fs.existsSync(path.join(
        process.env.GITHUB_WORKSPACE as string,
        `.${process.env.GITHUB_WORKFLOW as string}-cache`
      ))
    ).toBe(true)
  })
})
