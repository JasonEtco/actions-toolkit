workflow "Publish a release to npm" {
  on = "release"
  resolves = [
    "Validate release",
    "Publish release",
  ]
}

action "npm ci" {
  uses = "docker://node:alpine"
  args = "ci"
  runs = "npm"
}

action "Validate release" {
  uses = "JasonEtco/validate-semver-release@master"
}

action "npm run build" {
  uses = "docker://node:alpine"
  needs = [
    "npm ci",
    "Validate release",
  ]
  runs = "npm"
  args = "run build"
}

action "Publish release" {
  uses = "./.github/actions/publish-release"
  needs = ["npm run build"]
  secrets = ["NPM_AUTH_TOKEN"]
}
