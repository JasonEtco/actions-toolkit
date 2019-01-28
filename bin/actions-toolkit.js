const fs = require('fs')
const path = require('path')

const name = process.argv[2]

if (!name) {
  console.log(`\nUsage: npx actions-toolkit <name>`)
  process.exit(1)
}
const base = path.join(process.cwd(), name)

try {
  console.log(`Creating folder ${base}...`)
  fs.mkdirSync(base)
} catch (err) {
  if (err.code === 'EEXIST') {
    console.error(`Folder ${base} already exists!`)
  } else {
    console.error(err.code)
  }
  process.exit(1)
}

const { version } = require('../package.json')
const packageJson = {
  name,
  private: true,
  main: 'index.js',
  dependencies: {
    'actions-toolkit': `^${version}`
  }
}

const templateDir = path.join(__dirname, 'template')

console.log('Creating package.json...')
fs.writeFileSync(path.join(base, 'package.json'), JSON.stringify(packageJson, null, 2))

fs.readdirSync(templateDir).forEach(file => {
  const contents = fs.readFileSync(path.join(templateDir, file))
  console.log(`Creating ${file}...`)
  fs.writeFileSync(path.join(base, file), contents)
})

console.log(`\nDone! Enjoy building your GitHub Action! Get started with:\n\ncd ${name} && npm install`)
