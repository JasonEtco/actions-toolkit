jest.mock('fs')

beforeEach(() => {
  require('fs').__reset()
})

test.todo('prints help when no arguments are passed')
test.todo('prints help when --help is passed')
test.todo('fails to start creating project in a directory that already exists')
test.todo('creates project with labels passed to Dockerfile from questionnaire')
