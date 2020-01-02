import { graphql } from '@octokit/graphql'
import Octokit from '@octokit/rest'
import { withDefaults } from './graphql'

export class GitHub extends Octokit {
  public graphql: typeof graphql

  constructor (token: string) {
    super({ auth: `token ${token}` })
    this.graphql = withDefaults(token)
  }
}
