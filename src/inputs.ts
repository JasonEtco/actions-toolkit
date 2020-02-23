import * as core from '@actions/core'

export interface InputType { [key: string]: string | undefined }

export function createInputProxy <I extends InputType = InputType>() {
  return new Proxy<I>({} as I, {
    get (_, name: string) {
      // When we attempt to get `inputs.___`, instead
      // we call `core.getInput`.
      return core.getInput(name)
    },
    getOwnPropertyDescriptor() {
      // We need to overwrite this to ensure that
      // keys are enumerated
      return {
        enumerable: true,
        configurable: true,
        writable: false
      }
    },
    ownKeys () {
      const keys = Object.keys(process.env)
      const filtered = keys.filter(key => key.startsWith('INPUT_'))
      return filtered
    }
  })
}