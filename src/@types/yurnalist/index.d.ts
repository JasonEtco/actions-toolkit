declare module 'yurnalist' {
  type Tree = {
    name: string
    children?: Trees
    hint?: ?string
    hidden?: boolean
    color?: ?string
  }

  type Trees = Tree[]

  type Package = {
    name: string
    version: string
  }

  type Row = string[]

  export class Yurnalist {
    close ()
    table (head: string[], body: Row[])
    step (current: number, total: number, msg: string, emoji?: string)
    inspect (value: any)
    list (key: string, items: string[], hints?: object)
    header (command: string, pkg: Package)
    footer (showPeakMemory?: boolean)
    log (msg: string, opts: { force?: boolean })
    success (msg: string)
    error (msg: string)
    info (msg: string)
    command (command: string)
    warn (msg: string)
    question (question: string, options?: object): Promise<string>
    tree (key: string, trees: Trees, opts: { force?: boolean })
  }

  export default new Yurnalist()
}
