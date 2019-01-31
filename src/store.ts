import fs from 'fs'

export default class Store extends Map {
  public async write (path: string) {
    return new Promise((resolve, reject) => {
      const entries = this.entries()
      const contents = JSON.stringify(entries)
      fs.writeFile(path, contents, (err) => {
        if (err) return reject(err)
        return resolve()
      })
    })
  }
}
