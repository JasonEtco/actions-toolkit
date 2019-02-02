import fs from 'fs'
import path from 'path'
import { Store } from '../src/store'

describe('Store', () => {
  let workflow: string
  let workspace: string

  beforeEach(() => {
    workflow = process.env.GITHUB_WORKFLOW as string
    workspace = process.env.GITHUB_WORKSPACE as string
  })

  it('calls .save() on process exit', () => {
    const store = new Store(workflow, workspace)
    store.save = jest.fn()
    process.emit('exit' as 'disconnect')
    expect(store.save).toHaveBeenCalled()
  })

  it('actually saves on process exit', () => {
    const store = new Store(workflow, workspace)
    store.set('foo', 'bar')
    process.emit('exit' as 'disconnect')
    expect(
      fs.existsSync(path.join(
        workspace,
        `.${workflow}-cache`
      ))
    ).toBe(true)
  })

  it('does not save on process exit if the store is empty', () => {
    const file = `.tmp-cache`
    const store = new Store('tmp', workspace)
    expect(store.all()).toEqual({})

    process.emit('exit' as 'disconnect')
    expect(
      fs.existsSync(path.join(workspace, file))
    ).toBe(false)
  })
})
