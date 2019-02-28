const fs = jest.genMockFromModule('fs')
const realFs = jest.requireActual('fs')

const fileHolder = new Map()

// Allow reading from disk.
fs.readdir = realFs.readdir
fs.readFile = realFs.readFile

// Write file contents to memory.
fs.writeFile = (path, contents, cb) => {
  fileHolder.set(path, contents)
  // In mock world, we can never fail. :')
  cb(null)
}

// Add some helper methods for getting and setting memory FS.
fs.__reset = () => fileHolder.clear()
fs.__getContents = path => fileHolder.get(path)

module.exports = fs
