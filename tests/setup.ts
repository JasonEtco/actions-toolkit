import path from 'path'

Object.assign(process.env, {
  GITHUB_ACTION: 'my-action',
  GITHUB_ACTOR: 'JasonEtco',
  GITHUB_EVENT_NAME: 'push',
  GITHUB_EVENT_PATH: path.join(__dirname, 'fixtures', 'push.json'),
  GITHUB_REF: 'master',
  GITHUB_REPOSITORY: 'JasonEtco/actydoo',
  GITHUB_SHA: '123abc',
  GITHUB_TOKEN: '456def',
  GITHUB_WORKFLOW: 'my-workflow',
  GITHUB_WORKSPACE: path.join(__dirname, 'fixtures', 'workspaces', 'regular'),
  HOME: '?'
})
