import Octokit from '@octokit/rest'
import { withDefaults } from './graphql'

export class GitHub extends Octokit {
  public graphql: (query: string, variables?: any) => any

  constructor (token: string) {
    super({ auth: `token ${token}` })
    this.graphql = withDefaults(token)
  }
}
