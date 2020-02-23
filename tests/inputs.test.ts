import { createInputProxy, InputType } from "../src/inputs"

describe('createInputProxy', () => {
  let inputs: InputType

  beforeEach(() => {
    process.env.INPUT_EXAMPLE = 'pizza'
    process.env.INPUT_FOO = 'bar'
    inputs = createInputProxy()
  })

  afterEach(() => {
    delete process.env.INPUT_EXAMPLE
    delete process.env.INPUT_FOO
  })

  describe('#get', () => {
    it('returns the expected value', () => {
      const result = inputs.example
      expect(result).toBe('pizza')
    })
  
    it('accepts the correct types', () => {
      inputs = createInputProxy<{ example: string }>()
      const result = inputs.example
      expect(result).toBe('pizza')
    })
  })

  describe('#set', () => {
    it('does not allow properties to be set', () => {
      expect(() => inputs.test = 'test').toThrowError()
    })
  })

  describe('#ownKeys', () => {
    it('returns the filtered keys', () => {
      const keys = Object.keys(inputs)
      expect(keys).toEqual(['INPUT_EXAMPLE', 'INPUT_FOO'])
    })
  })
})