<h3 align="center">GitHub Actions Toolkit</h3>

<p align="center">
  A toolkit for building GitHub Actions in Node.js<br>
  <a href="#usage">Usage</a> •
  <a href="#api">API</a> •
  <a href="#actions-using-actions-toolkit">Actions using actions-toolkit</a> •
  <a href="#faq">FAQ</a>
</p>

<p align="center"><a href="https://npmjs.com/package/actions-toolkit"><img src="https://img.shields.io/npm/v/actions-toolkit/latest.svg" alt="NPM"></a> <a href="https://travis-ci.com/JasonEtco/actions-toolkit"><img src="https://badgen.now.sh/travis/JasonEtco/actions-toolkit" alt="Build Status"></a> <a href="https://codecov.io/gh/JasonEtco/actions-toolkit/"><img src="https://badgen.now.sh/codecov/c/github/JasonEtco/actions-toolkit" alt="Codecov"></a></p>



## Motivation

After building a GitHub Action in Node.js, it was clear to me that I was writing code that other actions will want to use. Reading files from the repository, making requests to the GitHub API, or running arbitrary executables on the project, etc.

So, I thought it'd be useful to build those out into library to help you build actions in Node.js :tada:

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
├── index.js
├── index.test.js
└── package.json
```

## API

* [The Toolkit class](#toolkit-options)
* [Authenticated GitHub API client](#toolsgithub)
* [Logging](#toolslog)
* [Slash commands](#toolscommandcommand-args-match--promise)
* [Parsing arguments](#toolsarguments)
* [Reading files](#toolsgetfilepath-encoding--utf8)
* [Run a CLI command](#toolsruninworkspacecommand-args-execaoptions)
* [In-repo configuration](#toolsconfigfilename)
* [Pass information to another action](#toolsstore)
* [End the action's process](#toolsexit)
* [Inspect the webhook event payload](#toolscontext)

### Toolkit options

#### event (optional)

An optional list of [events that this action works with](https://developer.github.com/actions/creating-workflows/workflow-configuration-options/#events-supported-in-workflow-files). If omitted, the action will run for any event - if present, the action will exit with a failing status code for any event that is not allowed.

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
  event: ['issues.created']
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
const newIssue = await tools.github.issues.create(tools.context.repo({
  title: 'New issue!',
  body: 'Hello Universe!'
}))
```

You can also make GraphQL requests:

```js
const result = await tools.github.graphql(query, variables)
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

### tools.config(filename)

Get the configuration settings for this action in the project workspace. This method can be used in three different ways:

```js
// Get the .rc file, parsed as JSON
const cfg = tools.config('.myactionrc')

// Get the YAML file, parsed as JSON
const cfg = tools.config('myaction.yml')

// Get the property in package.json
const cfg = tools.config('myaction')
```

If the filename looks like `.myfilerc` it will look for that file. If it's a YAML file, it will parse that file as a JSON object. Otherwise, it will return the value of the property in the `package.json` file of the project.

<br>

### tools.getPackageJSON()

Get the package.json file in the project root and returns it as an object.

```js
const pkg = tools.getPackageJSON()
```

<br>

### tools.getFile(path, [encoding = 'utf8'])

Get the contents of a file in the repository.

```js
const contents = tools.getFile('example.md')
```

<br>

### tools.runInWorkspace(command, [args], [ExecaOptions])

Run a CLI command in the workspace. This uses [execa](https://github.com/sindresorhus/execa) under the hood so check there for the [full options](https://github.com/sindresorhus/execa#options). For convenience, `args` can be a `string` or an array of `string`s.

```js
const result = await tools.runInWorkspace('npm', ['audit'])
```

<br>

### tools.arguments

An object of the parsed arguments passed to your action. This uses [`minimist`](https://github.com/substack/minimist) under the hood.

When inputting arguments into your workflow file (like `main.workflow`) in an action as shown in the [Actions Docs](https://developer.github.com/actions/creating-workflows/workflow-configuration-options/#action-blocks), you can enter them as an array of strings or as a single string:

```workflow
args = ["container:release", "--app", "web"]
# or
args = "container:release --app web"
```

In `actions-toolkit`, `tools.arguments` will be an object:

```js
console.log(tools.arguments)
// => { _: ['container:release'], app: 'web' }
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

### tools.store

Actions can pass information to each other by writing to a file that is shared across the workflow. `tools.store` is a modified instance of [`flat-cache`](https://www.npmjs.com/package/flat-cache):

Store a value:

```js
tools.store.set('foo', true)
```

Then, in a later action (or even the same action):

```js
const foo = tools.store.get('foo')
console.log(foo)
// -> true
```

**Note**: the file is only saved to disk when the process ends and your action completes. This is to prevent conflicts while writing to file. It will only write to a file if at least one key/value pair has been set. If you need to write to disk, you can do so with `tools.store.save()`.

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

#### tools.context.issue([object])

Return the `owner`, `repo`, and `number` params for making API requests against an issue or pull request. The object passed in will be merged with the repo params.

```js
const params = context.issue({body: 'Hello World!'})
// Returns: {owner: 'username', repo: 'reponame', number: 123, body: 'Hello World!'}
```

#### tools.context.repo([object])

Return the `owner` and `repo` params for making API requests against a repository.

```js
const params = context.repo({path: '.github/config.yml'})
// Returns: {owner: 'username', repo: 'reponame', path: '.github/config.yml'}
```

## Actions using actions-toolkit

- [create-an-issue](https://github.com/JasonEtco/create-an-issue)
- [deploy-lambda-action](https://github.com/lannonbr/deploy-lambda-action)
- [repo-permission-check-action](https://github.com/lannonbr/repo-permission-check-action)
- [add-an-issue-reference-action](https://github.com/kentaro-m/add-an-issue-reference-action)

## FAQ

**Can you get me into the GitHub Actions beta?**

I'm sorry, but I cannot.

**Aren't these just wrappers around existing functions?**

Yep! I just didn't want to rewrite them for my next Action, so here we are.
