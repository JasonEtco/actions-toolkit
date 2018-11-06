<h3 align="center">GitHub Actions Toolkit</h3>
<p align="center">A toolkit for building GitHub Actions in Node.js<p>
<p align="center"><a href="https://npmjs.com/package/actions-toolkit"><img src="https://badgen.net/npm/v/actions-toolkit" alt="NPM"></a> <a href="https://travis-ci.org/JasonEtco/actions-toolkit"><img src="https://badgen.now.sh/travis/JasonEtco/actions-toolkit" alt="Build Status"></a> <a href="https://codecov.io/gh/JasonEtco/actions-toolkit/"><img src="https://badgen.now.sh/codecov/c/github/JasonEtco/actions-toolkit" alt="Codecov"></a></p>

## Usage

### Installation

```sh
$ npm install actions-toolkit
```

```js
const Toolkit = require('actions-toolkit')
const tools = new Toolkit()
```

## How it works

### API

**`tools#createOctokit()`**

Returns an Octokit SDK client authenticated for this repository. See https://octokit.github.io/rest.js for the API.

```js
const octokit = tools.createOctokit()
const newIssue = await octokit.issues.create(context.repo({
  title: 'New issue!',
  body: 'Hello Universe!'
}))
```

**`tools#getPackageJSON()`**

Returns a JSON object of the repo's `package.json` file.

```js
const pkg = tools.getPackageJSON()
```

**`tools#getFile(filename: string)`**

Returns the contents of the given file in your repository.

```js
const readme = tools.getFile('README.md')
```

**`tools.config(filename)`**
Returns a configuration object that repositories can create to customize the action.

```js
// Returns the `my-action` property from the repo's `package.json`
const myActionsConfigs = tools.config('my-action')
// Or returns a YAML file, parsed as JSON
const myActionsConfigs = tools.config('my-action.yml')
// Or returns a .my-actionrc file, parsed as JSON
const myActionsConfigs = tools.config('.my-actionrc')
```

**`tools.context#repo([object])`**

```js
// Get the repo
console.log(tools.context.repo({ foo: true }))
// => { owner: 'JasonEtco', repo: 'actions-toolkit', foo: true }

// Get the issue (if this action was triggered by an issue or PR)
console.log(tools.context.issue({ foo: true }))
// => { owner: 'JasonEtco', repo: 'actions-toolkit', number: 2, foo: true }
```

### Properties

```js
// Get the webhook payload that triggered the action
const payload = tools.context.payload
// Get the webhook event name that triggered the action
const event = tools.context.event

// Get a path to the workspace
const workspace = tools.workspace

// Get your GitHub API token
const token = tools.token
```