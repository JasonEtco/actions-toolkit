class Context {
  constructor () {
    this.payload = require(process.env.GITHUB_EVENT_PATH)
    this.sha = process.env.GITHUB_SHA
    this.ref = process.env.GITHUB_REF
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
  repo (object) {
    const repo = this.payload.repository

    if (!repo) {
      throw new Error('toolkit.context.repo() is not supported for this webhook event.')
    }

    return {
      owner: repo.owner.login || repo.owner.name,
      repo: repo.name,
      ...object
    }
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
  issue (object) {
    const payload = this.payload
    return this.repo({
      number: (payload.issue || payload.pull_request || payload).number,
      ...object
    })
  }
}

module.exports = Context
