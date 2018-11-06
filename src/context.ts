import { WebhookPayloadWithRepository } from './webhooks'

export default class Context {
  /**
   * Webhook payload object that triggered the workflow
   */
  public payload: WebhookPayloadWithRepository
  /**
   * Name of the event that triggered the workflow
   */
  public event: string
  public sha: string
  public ref: string
  public workflow: string
  public action: string
  public actor: string

  constructor () {
    this.payload = process.env.GITHUB_EVENT_PATH ? require(process.env.GITHUB_EVENT_PATH) : {}
    this.event = process.env.GITHUB_EVENT_NAME as string
    this.sha = process.env.GITHUB_SHA as string
    this.ref = process.env.GITHUB_REF as string
    this.workflow = process.env.GITHUB_WORKFLOW as string
    this.action = process.env.GITHUB_ACTION as string
    this.actor = process.env.GITHUB_ACTOR as string
  }

  /**
   * Return the `owner` and `repo` params for making API requests against a
   * repository.
   *
   * ```js
   * const params = context.repo({path: '.github/config.yml'})
   * // Returns: {owner: 'username', repo: 'reponame', path: '.github/config.yml'}
   * ```
   *
   * @param object - Params to be merged with the repo params.
   *
   */
  public repo<T> (object?: T) {
    const repo = this.payload.repository

    if (!repo) {
      throw new Error('context.repo() is not supported for this webhook event.')
    }

    return Object.assign({
      owner: repo.owner.login,
      repo: repo.name
    }, object)
  }

  /**
   * Return the `owner`, `repo`, and `number` params for making API requests
   * against an issue or pull request. The object passed in will be merged with
   * the repo params.
   *
   * ```js
   * const params = context.issue({body: 'Hello World!'})
   * // Returns: {owner: 'username', repo: 'reponame', number: 123, body: 'Hello World!'}
   * ```
   *
   * @param object - Params to be merged with the issue params.
   */
  public issue<T> (object?: T) {
    const payload = this.payload
    return Object.assign({
      number: (payload.issue || payload.pull_request || payload).number
    }, this.repo(object))
  }
}
