const semver = require('semver')
const { Toolkit } = require('actions-toolkit')
const tools = new Toolkit()

const pkg = tools.getPackageJSON()
const { release } = tools.context.payload

if (release.draft) {
  tools.exit.neutral('This release is a draft! Aborting.')
}

const tag = semver.valid(release.tag_name)
if (!tag) {
  tools.exit.failure(`The tag ${release.tag_name} is not a valid tag.`)
}

if (pkg.version !== tag) {
  tools.exit.failure(`Tag ${tag} and version in the package.json ${pkg.version} are not the same.`)
}

if (release.prerelease) {
  const prerelease_tag = semver.prerelease(release.tag_name)

  if (prerelease_tag === null) {
    tools.exit.failure(`The release is a prerelease, but the version tag is not.`)
  }

  const VALID_TAGS = ['beta', 'next']
  const [tag_name] = prerelease_tag

  if (!VALID_TAGS.includes(tag_name)) {
    tools.exit.failure(`Publish tag ${tag_name} is not a valid tag - it must be one of ${VALID_TAGS.join(', ')}`)
  }

  fs.writeFileSync(path.join(tools.workspace, 'release-workflow-tag'), tag_name)
}

tools.exit.success(`Release of version ${tag} is all set!`)
