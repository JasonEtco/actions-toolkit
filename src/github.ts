import Octokit from '@octokit/rest'

export class GitHub extends Octokit {
  constructor (token: string) {
    super({ auth: `token ${token}` })
  }
}
