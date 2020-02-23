/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs')
const https = require('https')
const path = require('path')

https.get('https://unpkg.com/feather-icons/dist/icons.json', resp => {
  let data = ''

  resp.on('data', chunk => {
    data += chunk
  })

  resp.on('end', () => {
    const icons = JSON.parse(data)
    const iconNames = Object.keys(icons)

    const iconsFilePath = path.join(process.cwd(), 'bin', 'feather-icons.json')

    fs.writeFile(iconsFilePath, JSON.stringify(iconNames, null, 2), err => {
      if (err) throw err
    })
  })
})
