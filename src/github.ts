import { graphql } from '@octokit/graphql'
import { Octokit } from '@octokit/rest'

export class GitHub extends Octokit {
  public graphql: typeof graphql

  constructor (token: string) {
    super({ auth: `token ${token}` })
    this.graphql = graphql.defaults({
      headers: { authorization: `token ${token}` }
    })
  }
}
