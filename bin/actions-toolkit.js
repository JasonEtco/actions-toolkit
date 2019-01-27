const fs = require('fs')
const path = require('path')

const name = process.argv[2]

if (!name) {
  console.log(`\nUsage: npx actions-toolkit <name>`)
  process.exit(1)
}

const version = require('../package.json').version
const packageJson = {
  name,
  private: true,
  main: 'index.js',
  dependencies: {
    'actions-toolkit': `^${version}`
  }
}

const templateDir = path.join(__dirname, 'template')
const base = path.join(process.cwd(), name)

console.log(`Creating folder ${base}...`)
fs.mkdirSync(base)

console.log('Creating package.json...')
fs.writeFileSync(path.join(base, 'package.json'), JSON.stringify(packageJson, null, 2))

fs.readdirSync(templateDir).forEach(file => {
  const contents = fs.readFileSync(path.join(templateDir, file))
  console.log(`Creating ${file}...`)
  fs.writeFileSync(path.join(base, file), contents)
})
