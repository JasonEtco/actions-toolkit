#!/usr/bin/env node

const createAction = require('./create-action')

createAction(process.argv.slice(2))
  .then(() => {
    process.exit(0)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
