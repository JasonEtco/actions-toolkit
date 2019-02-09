const semver = require('semver')
const { Toolkit } = require('actions-toolkit')
const tools = new Toolkit()

const pkg = tools.getPackageJSON()
const { release } = tools.context.payload

// Little helper function to log an error then exit
function fail (message) {
  console.error(message)
  process.exit(1)
}

if (release.draft) {
  console.log('This release is a draft! Aborting.')
  // Exiting with a 78 makes it a "Neutral" result
  process.exit(78)
}

const tag = semver.valid(release.tag_name)
if (!tag) {
  fail(`The tag ${release.tag_name} is not a valid tag.`)
}

if (pkg.version !== tag) {
  fail(`Tag ${tag} and version in the package.json ${pkg.version} are not the same.`)
}

if (release.prerelease) {
  const prerelease_tag = semver.prerelease(release.tag_name)

  if (prerelease_tag === null) {
    fail(`The release is a prerelease, but the version tag is not.`)
  }

  const VALID_TAGS = ['beta', 'next']
  const [tag_name] = prerelease_tag

  if (!VALID_TAGS.includes(tag_name)) {
    fail(`Publish tag ${tag_name} is not a valid tag - it must be one of ${VALID_TAGS.join(', ')}`)
  }

  fs.writeFileSync(path.join(tools.workspace, 'release-workflow-tag'), tag_name)
}

console.log(`Release of version ${tag} is all set!`)
