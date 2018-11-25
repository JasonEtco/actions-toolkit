<h3 align="center">GitHub Actions Toolkit</h3>
<p align="center">A toolkit for building GitHub Actions in Node.js<p>
<p align="center"><a href="https://npmjs.com/package/actions-toolkit"><img src="https://badgen.net/npm/v/actions-toolkit" alt="NPM"></a> <a href="https://travis-ci.com/JasonEtco/actions-toolkit"><img src="https://badgen.now.sh/travis/JasonEtco/actions-toolkit" alt="Build Status"></a> <a href="https://codecov.io/gh/JasonEtco/actions-toolkit/"><img src="https://badgen.now.sh/codecov/c/github/JasonEtco/actions-toolkit" alt="Codecov"></a></p>

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

const octokit = tools.createOctokit()
const newIssue = await octokit.issues.create(tools.context.repo({
  title: 'Hello Universe!'
}))
```

## API

### `tools.createOctokit()`

Returns an [Octokit SDK](https://octokit.github.io/rest.js) client authenticated for this repository. See [https://octokit.github.io/rest.js](https://octokit.github.io/rest.js) for the API.

```js
const octokit = tools.createOctokit()
const newIssue = await octokit.issues.create(context.repo({
  title: 'New issue!',
  body: 'Hello Universe!'
}))
```

<br>

### `tools.config(filename)`

Get the configuration settings for this action in the project workspace. This method can be used in three different ways:

```js
// Get the .rc file, parsed as JSON
const cfg = toolkit.config('.myactionrc')

// Get the YAML file, parsed as JSON
const cfg = toolkit.config('myaction.yml')

// Get the property in package.json
const cfg = toolkit.config('myaction')
```

If the filename looks like \`.myfilerc\` it will look for that file. If it's a YAML file, it will parse that file as a JSON object. Otherwise, it will return the value of the property in the \`package.json\` file of the project.

<br>

### `tools.getPackageJSON()`

Get the package.json file in the project root and returns it as an object.

```js
const pkg = toolkit.getPackageJSON()
```

<br>

### `tools.runInWorkspace(command, [args], [ExecaOptions])`

Run a CLI command in the workspace. This uses [execa](https://github.com/sindresorhus/execa) under the hood so check there for the [full options](https://github.com/sindresorhus/execa#options). For convenience, `args` can be a `string` or an array of `string`s.

<br>

###  `tools.arguments`

An object of the parsed arguments passed to your action. This uses [`minimist`]() under the hood.

```js
// node file.js --pizza pepperoni
console.log(tools.arguments)
// => { _: ['file.js'], pizza: 'pepperoni' }
```

<br>

### `tools.token`

The GitHub API token being used to authenticate requests.

### `tools.workspace`

<br>

A path to a clone of the repository.

### `tools.context`

#### `tools.context.action`

The name of the action

#### `tools.context.actor`

The actor that triggered the workflow (usually a user's login)

#### `tools.context.event`

The name of the event that triggered the workflow

#### `tools.context.payload`

A JSON object of the webhook payload object that triggered the workflow

#### `tools.context.ref`

The Git `ref` at which the action was triggered

#### `tools.context.sha`

The Git `sha` at which the action was triggered

#### `tools.context.workflow`

The name of the workflow that was triggered.

#### `tools.context.issue([object])`

Return the `owner`, `repo`, and `number` params for making API requests against an issue or pull request. The object passed in will be merged with the repo params.

```js
const params = context.issue({body: 'Hello World!'})
// Returns: {owner: 'username', repo: 'reponame', number: 123, body: 'Hello World!'}
```

#### `tools.context.repo([object])`

Return the `owner` and `repo` params for making API requests against a repository.

```js
const params = context.repo({path: '.github/config.yml'})
// Returns: {owner: 'username', repo: 'reponame', path: '.github/config.yml'}
```

## Actions using actions-toolkit

- [create-an-issue](https://github.com/JasonEtco/create-an-issue)

## FAQ

**Can you get me into the GitHub Actions beta?**

I'm sorry, but I cannot.

**Aren't these just wrappers around existing functions?**

Yep! I just didn't want to rewrite them for my next Action, so here we are.
