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

// Returns an Octokit SDK client authenticated for this repo
const octokit = tools.createOctokit()

// Returns a JSON object of the repo's `package.json` file
const pkg = tools.getPackageJSON('package.json')

// Returns the contents of the `README.md` file
const readme = tools.getFile('README.md')

// Returns `{ "my-action": {} }` from the repo's `package.json`
const myActionsConfigs = tools.config('my-action')
// Or returns a YAML file
const myActionsConfigs = tools.config('my-action.yml')
// Or returns a .my-actionrc file
const myActionsConfigs = tools.config('.my-actionrc')

// Get the webhook payload that triggered the action
const payload = tools.context.payload
// Get the webhook event name that triggered the action
const event = tools.context.event

// Get the repo
console.log(tools.context.repo())
// => { owner: 'JasonEtco', repo: 'actions-toolkit' }

// Get a path to the workspace
const workspace = tools.workspace
```

## How it works

Like magic!
