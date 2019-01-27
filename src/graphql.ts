import graphql from '@octokit/graphql'

export const withDefaults = (token: string) => graphql.defaults({
  headers: { authorization: `token ${token}` }
})
