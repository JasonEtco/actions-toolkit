workflow "Publish a release to npm" {
  on = "release"
  resolves = ["Validate release", "Publish release"]
}

action "GitHub Action for npm" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "ci"
}

action "Validate release" {
  uses = "JasonEtco/validate-semver-release@master"
}

action "Publish release" {
  uses = "./.github/actions/publish-release"
  needs = ["GitHub Action for npm", "Validate release"]
  secrets = ["NPM_AUTH_TOKEN"]
}
