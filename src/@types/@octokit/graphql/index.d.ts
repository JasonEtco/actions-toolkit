declare module '@octokit/graphql' {
  export interface GraphQlQueryResponse {
    data: { [ key: string ]: any } | null
    errors?: [{
      message: string
      path: [string]
      extensions: { [ key: string ]: any }
      locations: [{
        line: number,
        column: number
      }]
    }]
  }

  export interface GraphQLError {
    message: string,
    locations?: Array<{ line: number, column: number }>,
    path?: Array<string | number>,
    extensions?: {
      [key: string]: any
    }
  }

  export function defaults (options: any): (query: string, variables?: any) => Promise<GraphQlQueryResponse>
}
