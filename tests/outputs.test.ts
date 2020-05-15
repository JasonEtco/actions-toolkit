import * as core from '@actions/core'
import { createOutputProxy, OutputType } from '../src/outputs'

jest.mock('@actions/core')

describe('createOutputProxy', () => {
  let outputs: OutputType

  describe('#set', () => {
    it('calls `core.setOutput`', () => {
      const spy = jest.spyOn(core, 'setOutput')
      outputs = createOutputProxy<{ example: string }>()
      outputs.example = 'pizza'
      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledWith('example', 'pizza')
    })

    it('can get after setting', () => {
      outputs = createOutputProxy<{ example: string }>()
      outputs.example = 'yep'
      expect(outputs.example).toBe('yep')
    })
  })
})