const path = require('path')

Object.assign(process.env, {
  HOME: '?',
  GITHUB_WORKFLOW: 'my-workflow',
  GITHUB_ACTION: 'my-action',
  GITHUB_ACTOR: 'JasonEtco',
  GITHUB_REPOSITORY: 'JasonEtco/actydoo',
  GITHUB_EVENT_NAME: 'push',
  GITHUB_EVENT_PATH: path.join(__dirname, 'fixtures', 'push.json'),
  GITHUB_WORKSPACE: path.join(__dirname, 'fixtures', 'workspace'),
  GITHUB_SHA: '123abc',
  GITHUB_REF: 'master',
  GITHUB_TOKEN: '456def'
})
