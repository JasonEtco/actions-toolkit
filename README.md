<h3 align="center">GitHub Actions Toolkit</h3>
<p align="center">A toolkit for building GitHub Actions in Node.js<p>
<p align="center"><a href="https://npmjs.com/package/actions-toolkit"><img src="https://badgen.net/npm/v/actions-toolkit" alt="NPM"></a> <a href="https://travis-ci.org/JasonEtco/actions-toolkit"><img src="https://badgen.now.sh/travis/JasonEtco/actions-toolkit" alt="Build Status"></a> <a href="https://codecov.io/gh/JasonEtco/actions-toolkit/"><img src="https://badgen.now.sh/codecov/c/github/JasonEtco/actions-toolkit" alt="Codecov"></a></p>

## Motivation

After building a GitHub Action in Node.js, it was clear to me that I was writing code that other actions will want to use. Reading files from the repository, making requests to the GitHub API, or running arbitrary executables on the project, etc.

So, I thought it'd be useful to build those out into library to help you build actions in Node.js :tada:

## Usage

### Installation

```sh
$ npm install actions-toolkit
```

```js
const Toolkit = require('actions-toolkit')
const tools = new Toolkit()
```

You can see the full [API docs here](./docs/API.md)!

## FAQ

**Can you get me into the GitHub Actions beta?**
I'm sorry, but I can't :sob:

**Aren't these just wrappers around existing functions?**
Yep! I just didn't want to rewrite them for my next Action, so here we are.

**
