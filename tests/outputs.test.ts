import { createOutputProxy, OutputType } from "../src/outputs"

describe('createOutputProxy', () => {
  let outputs: OutputType

  beforeEach(() => {
    outputs = createOutputProxy()
    outputs.test = 'TEST'
  })


  describe('#set', () => {
    it('reject not expected type value', () => {
      outputs = createOutputProxy<{ example: string }>()
      
      expect(() => { outputs.example = undefined }).not.toThrowError()
    })
  
    it('accepts the correct types', () => {
      outputs = createOutputProxy<{ example: string }>()
      
      expect(() => { outputs.example = 'pizza' }).not.toThrowError()
    })
  })

})