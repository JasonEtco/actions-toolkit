workflow "Publish a release to npm" {
  on = "release"
  resolves = ["npm publish"]
}

# Checks that the release is not a draft
# and it is attached to a valid semver tag
action "validate release" {
  uses = "./.github/actions/validate-release"
}

action "npm ci" {
  uses = "actions/npm@master"
  args = "ci"
}

action "npm publish" {
  needs = ["validate release", "npm ci"]
  uses = "actions/npm@master"
  args = "publish"
  secrets = ["NPM_AUTH_TOKEN"]
}
