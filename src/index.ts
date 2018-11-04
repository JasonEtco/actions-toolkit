import Toolkit from './toolkit'

const requiredEnvVars = [
  'HOME',
  'GITHUB_WORKFLOW',
  'GITHUB_ACTION',
  'GITHUB_ACTOR',
  'GITHUB_REPOSITORY',
  'GITHUB_EVENT_NAME',
  'GITHUB_EVENT_PATH',
  'GITHUB_WORKSPACE',
  'GITHUB_SHA',
  'GITHUB_REF',
  'GITHUB_TOKEN'
]

const requiredButMissing = requiredEnvVars.filter(key => process.env.hasOwnProperty(key))
if (requiredButMissing.length > 0) {
  // This isn't being run inside of a GitHub Action environment!
  console.warn(`There are environment variables missing from this runtime, but would be present on GitHub.\n${requiredButMissing.map(key => `- ${key}`).join('\n')}`)
}

export default Toolkit
module.exports = Toolkit
