export interface WebhookEvent {
  id: string
  name: string
  payload: WebhookPayloadWithRepository
  protocol?: 'http' | 'https'
  host?: string
  url?: string
}

export interface PayloadRepository {
  [key: string]: any
  full_name?: string
  name: string
  owner: {
    [key: string]: any
    login: string
    name?: string
  }
  html_url?: string
}

export interface WebhookPayloadWithRepository {
  [key: string]: any
  repository?: PayloadRepository
  issue?: {
    [key: string]: any
    number: number
    html_url?: string
    body?: string
  }
  pull_request?: {
    [key: string]: any
    number: number
    html_url?: string
    body?: string
  }
  sender?: {
    [key: string]: any
    type: string
  }
  action?: string
  installation?: {
    id: number
    [key: string]: any
  }
}

export class Context {
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

  public get issue () {
    const payload = this.payload

    return {
      ...this.repo,
      number: (payload.issue || payload.pull_request || payload).number
    }
  }

  public get repo () {
    if (process.env.GITHUB_REPOSITORY) {
      const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
      return { owner, repo }
    }

    if (this.payload.repository) {
      return {
        owner: this.payload.repository.owner.login,
        repo: this.payload.repository.name
      }
    }

    throw new Error('context.repo requires a GITHUB_REPOSITORY environment variable like \'owner/repo\'')
  }
}
