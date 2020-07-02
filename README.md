<h3 align="center">GitHub Actions Toolkit</h3>

<p align="center">
  An opinionated toolkit for building GitHub Actions in Node.js<br>
  <a href="#usage">Usage</a> •
  <a href="#api">API</a> •
  <a href="#how-to-test-your-github-actions">How to test your Action</a> •
  <a href="#faq">FAQ</a>
</p>

<p align="center"><a href="https://github.com/JasonEtco/actions-toolkit"><img alt="GitHub Actions status" src="https://github.com/JasonEtco/actions-toolkit/workflows/Node%20CI/badge.svg"></a> <a href="https://codecov.io/gh/JasonEtco/actions-toolkit/"><img src="https://badgen.now.sh/codecov/c/github/JasonEtco/actions-toolkit" alt="Codecov"></a></p>

This toolkit is an opinionated alternative to (and wrapper around) the [official toolkit](https://github.com/actions/toolkit). `actions/toolkit` makes many features optional in the interest of performance, so you may prefer to use it instead of this library.

## Usage

### Installation

```sh
$ npm install actions-toolkit
```

```js
const { Toolkit } = require('actions-toolkit')
const tools = new Toolkit()
```

### Bootstrap a new action

```
$ npx actions-toolkit my-cool-action
```

This will create a new folder `my-cool-action` with the following files:

```
├── Dockerfile
├── action.yml
├── index.js
├── index.test.js
└── package.json
```

## API

* [The Toolkit class](#toolkit-options)
* [Authenticated GitHub API client](#toolsgithub)
* [Logging](#toolslog)
* [Getting workflows' inputs](#toolsinputs)
* [Output information from your action](#toolsoutputs)
* [Slash commands](#toolscommandcommand-args-match--promise)
* [Reading files](#toolsreadfilepath-encoding--utf8)
* [Run a CLI command](#toolsexec)
* [End the action's process](#toolsexit)
* [Inspect the webhook event payload](#toolscontext)

### Toolkit options

#### event (optional)

An optional list of [events that this action works with](https://help.github.com/en/actions/reference/events-that-trigger-workflows). If omitted, the action will run for any event - if present, the action will exit with a failing status code for any event that is not allowed.

```js
const tools = new Toolkit({
  event: ['issues', 'pull_requests']
})
```

You can also pass a single string:

```js
const tools = new Toolkit({
  event: 'issues'
})
```

And/or strings that include an action (what actually happened to trigger this event) for even more specificity:

```js
const tools = new Toolkit({
  event: ['issues.opened']
})
```

#### secrets (optional)

You can choose to pass a list of secrets that must be included in the workflow that runs your Action. This ensures that your Action has the secrets it needs to function correctly:

```js
const tools = new Toolkit({
  secrets: ['SUPER_SECRET_KEY']
})
```

If any of the listed secrets are missing, the Action will fail and log a message.

#### token (optional)

You can pass a custom token used for authenticating with the GitHub API:

```js
const tools = new Toolkit({
  token: '1234567890abcdefghi'
})
```

The `github_token` input or `process.env.GITHUB_TOKEN` will be used if no `token` was passed.

### Toolkit.run

Run an asynchronous function that receives an instance of `Toolkit` as its argument. If the function throws an error (or returns a rejected promise), `Toolkit.run` will log the error and exit the action with a failure status code.

The toolkit instance can be configured by passing `Toolkit` options as the second argument to `Toolkit.run`.

```js
Toolkit.run(async tools => {
  // Action code
}, { event: 'push' })
```
<br>

### tools.github

Returns an [Octokit SDK](https://octokit.github.io/rest.js) client authenticated for this repository. See [https://octokit.github.io/rest.js](https://octokit.github.io/rest.js) for the API.

```js
const newIssue = await tools.github.issues.create({
  ...tools.context.repo,
  title: 'New issue!',
  body: 'Hello Universe!'
})
```

You can also make GraphQL requests:

```js
const result = await tools.github.graphql(query, variables)
```

See [https://github.com/octokit/graphql.js](https://github.com/octokit/graphql.js) for more details on how to leverage the GraphQL API.

**Note:** To make this function, you must pass a GitHub API token to your action. You can do this in the workflow - both of these are automatically used if they exist:

```yaml
uses: your/action@v1
with:
  github_token: ${{ github.token }}
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

<br>

### tools.log

This library comes with a slightly-customized instance of [Signale](https://github.com/klaussinani/signale), a great **logging utility**. Check out their docs for [the full list of methods](https://github.com/klaussinani/signale#usage). You can use those methods in your action:

```js
tools.log('Welcome to this example!')
tools.log.info('Gonna try this...')
try {
  risky()
  tools.log.success('We did it!')
} catch (error) {
  tools.log.fatal(error)
}
```

In the GitHub Actions output, this is the result:

```
ℹ  info      Welcome to this example!
ℹ  info      Gonna try this...
✖  fatal     Error: Something bad happened!
    at Object.<anonymous> (/index.js:5:17)
    at Module._compile (internal/modules/cjs/loader.js:734:30)
```

<br>

### tools.inputs

GitHub Actions workflows can define some "inputs" - options that can be passed to the action:

```yaml
uses: JasonEtco/example-action@v1
with:
  foo: bar
```

You can access those using `tools.inputs`:

```js
console.log(tools.inputs.foo) // -> 'bar'
```

_Note!_ This is not a plain object, it's an instance of [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), so be aware that there may be some differences.

<br>

### tools.outputs

GitHub Actions workflows can define some "outputs" - options that can be passed to the next actions. You can access those using `tools.outputs`:

```js
tools.outputs.foo = 'bar'
```

_Note!_ This is not a plain object, it's an instance of [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), so be aware that there may be some differences.

<br>

### tools.command(command, (args, match) => Promise<void>)

Respond to a slash-command posted in a GitHub issue, comment, pull request, pull request review or commit comment. Arguments to the slash command are parsed by [minimist](https://github.com/substack/minimist). You can use a slash command in a larger comment, but the command must be at the start of the line:

```
Hey, let's deploy this!
/deploy --app example --container node:alpine
```

```ts
tools.command('deploy', async (args: ParsedArgs, match: RegExpExecArray) => {
  console.log(args)
  // -> { app: 'example', container: 'node:alpine' }
})
```

The handler will run multiple times for each match:

```
/deploy 1
/deploy 2
/deploy 3
```

```ts
let i = 0
await tools.command('deploy', () => { i++ })
console.log(i)
// -> 3
```

<br>

### tools.getPackageJSON()

Get the package.json file in the project root and returns it as an object.

```js
const pkg = tools.getPackageJSON()
```

<br>

### tools.readFile(path, [encoding = 'utf8'])

Get the contents of a file in the repository. Should be used with [actions/checkout](https://github.com/actions/checkout) to clone the repository in the actions workflow.

```js
const contents = await tools.readFile('example.md')
```

<br>

### tools.exec

Run a CLI command in the workspace. This uses [@actions/exec](https://github.com/actions/toolkit/tree/HEAD/packages/exec) under the hood so check there for the full usage.

```js
const result = await tools.exec('npm audit')
```

<br>

### tools.token

The GitHub API token being used to authenticate requests.

<br>

### tools.workspace

A path to a clone of the repository.

<br>

### tools.exit

A collection of methods to end the action's process and tell GitHub what status to set (success, neutral or failure). Internally, these methods call `process.exit` with the [appropriate exit code](https://developer.github.com/actions/creating-github-actions/accessing-the-runtime-environment/#exit-codes-and-statuses). You can pass an optional message to each one to be logged before exiting. This can be used like an early return:

```js
if (someCheck) tools.exit.neutral('No _action_ necessary!')
if (anError) tools.exit.failure('We failed!')
tools.exit.success('We did it team!')
```

<br>

### tools.context

#### tools.context.action

The name of the action

#### tools.context.actor

The actor that triggered the workflow (usually a user's login)

#### tools.context.event

The name of the event that triggered the workflow

#### tools.context.payload

A JSON object of the webhook payload object that triggered the workflow

#### tools.context.ref

The Git `ref` at which the action was triggered

#### tools.context.sha

The Git `sha` at which the action was triggered

#### tools.context.workflow

The name of the workflow that was triggered.

#### tools.context.issue

The `owner`, `repo`, and `issue_number` params for making API requests against an issue or pull request.

#### tools.context.pullRequest

The `owner`, `repo`, and `pull_number` params for making API requests against a pull request.

#### tools.context.repo

The `owner` and `repo` params for making API requests against a repository. This uses the `GITHUB_REPOSITORY` environment variable under the hood.

## How to test your GitHub Actions

Similar to building CLIs, GitHub Actions usually works by running a file with `node <file>`; this means that writing a complete test suite can be tricky. Here's a pattern for writing tests using actions-toolkit, by mocking `Toolkit.run`:

<details>
<summary>index.js</summary>

```js
const { Toolkit } = require('actions-toolkit')
Toolkit.run(async tools => {
  tools.log.success('Yay!')
})
```
</details>


<details>
<summary>index.test.js</summary>

```js
const { Toolkit } = require('actions-toolkit')
describe('tests', () => {
  let action

  beforeAll(() => {
    // Mock `Toolkit.run` to redefine `action` when its called
    Toolkit.run = fn => { action = fn }
    // Require the index.js file, after we've mocked `Toolkit.run`
    require('./index.js')
  })

  it('logs successfully', async () => {
    // Create a fake instance of `Toolkit`
    const fakeTools = new Toolkit()
    // Mock the logger, or whatever else you need
    fakeTools.log.success = jest.fn()
    await action(fakeTools)
    expect(fakeTools.log.success).toHaveBeenCalled()
  })
})
```
</details>

You can then mock things by tweaking environment variables and redefining `tools.context.payload`. You can check out [this repo's tests](https://github.com/JasonEtco/create-an-issue/blob/HEAD/tests/) as an example.

## Motivation

**actions-toolkit** is a wrapper around some fantastic open source libraries, and provides some helper methods for dealing with the GitHub Actions runtime. Actions all run in Docker containers, so this library aims to help you focus on your code and not the runtime. You can learn more about [building Actions in Node.js](https://jasonet.co/posts/building-github-actions-in-node/) to get started!

After building a GitHub Action in Node.js, it was clear to me that I was writing code that other actions will want to use. Reading files from the repository, making requests to the GitHub API, or running arbitrary executables on the project, etc.

So, I thought it'd be useful to build those out into a library to help you build actions in Node.js :tada:

## FAQ

**Aren't these just wrappers around existing functions?**

Yep! I just didn't want to rewrite them for my next Action, so here we are.

**What's the difference between this and [actions/toolkit](https://github.com/actions/toolkit)?**

This library was the inspiration for the official toolkit. Nowadays, it's an opinionated alternative. My goal for the library is to make building simple actions easy, while the official toolkit needs to support more complicated use-cases (like performance and scaling concerns).
