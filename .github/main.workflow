workflow "Publish a release to npm" {
  on = "release"
  resolves = ["publish release"]
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

action "publish release" {
  needs = ["validate release", "npm ci"]
  uses = "./.github/actions/publish-release"
  secrets = ["NPM_AUTH_TOKEN"]
}
