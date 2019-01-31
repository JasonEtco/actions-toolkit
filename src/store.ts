import fs from 'fs'

export default class Store extends Map<string, any> {
  constructor (path: string) {
    if (fs.existsSync(path)) {
      const contents = fs.readFileSync(path, 'utf8')
      const json = JSON.parse(contents)
      super(json)
    } else {
      super()
    }

    process.on('exit', async () => {
      if (this.size === 0) return
      return this.write(path)
    })
  }

  public async write (path: string) {
    return new Promise((resolve, reject) => {
      const contents = JSON.stringify(Array.from(this))
      fs.writeFile(path, contents, (err) => {
        if (err) return reject(err)
        return resolve()
      })
    })
  }
}
