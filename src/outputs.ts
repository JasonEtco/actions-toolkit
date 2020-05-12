import * as core from '@actions/core'

export interface OutputType { [key: string]: string | undefined }

export function createOutputProxy <O extends OutputType = OutputType>() {
  return new Proxy<O>({} as O, {
    set (_, name: string, value: string): boolean {
      // When we attempt to get `outputs.___`, instead
      // we call `core.setOutput`.
      core.setOutput(name, value)
      return true;
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: false,
        configurable: true,
        writable: true
      }
    }
  })
}