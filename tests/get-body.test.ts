import { WebhookPayloadWithRepository } from '../src/context'
import { getBody } from '../src/get-body'

describe('getBody', () => {
  let payload: WebhookPayloadWithRepository

  beforeEach(() => {
    payload = {
      repository: { name: 'pizza', owner: { login: 'JasonEtco' } }
    }
  })

  it('returns the body of an issue', () => {
    payload.issue = { number: 1, body: 'hello' }
    expect(getBody(payload)).toBe('hello')
  })

  it('returns the body of an issue', () => {
    payload.pull_request = { number: 1, body: 'hello' }
    expect(getBody(payload)).toBe('hello')
  })

  it('returns the body of an comment', () => {
    payload.comment = { body: 'hello' }
    payload.issue = { number: 1, body: 'goodbye' }
    expect(getBody(payload)).toBe('hello')
  })

  it('returns the body of a review', () => {
    payload.review = { body: 'hello' }
    expect(getBody(payload)).toBe('hello')
  })

  it('returns undefined if no body was found', () => {
    expect(getBody(payload)).toBe(undefined)
  })
})
