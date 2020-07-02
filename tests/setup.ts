import path from 'path'

Object.assign(process.env, {
  GITHUB_ACTION: 'my-action',
  GITHUB_ACTOR: 'JasonEtco',
  GITHUB_EVENT_NAME: 'issues',
  GITHUB_EVENT_PATH: path.join(__dirname, 'fixtures', 'issues.opened.json'),
  GITHUB_REF: 'main',
  GITHUB_REPOSITORY: 'JasonEtco/test',
  GITHUB_SHA: '123abc',
  GITHUB_TOKEN: '456def',
  GITHUB_WORKFLOW: 'my-workflow',
  GITHUB_WORKSPACE: path.join(__dirname, 'fixtures', 'workspaces', 'regular'),
  HOME: '?'
})
