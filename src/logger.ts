import { Signale, DefaultMethods } from 'signale'

export const defaultCommands: [DefaultMethods, string][] = [
  ['error', '::error::'],
  ['fatal', '::error::'],
  ['warn', '::warning::'],
  ['debug', '::debug::']
]

export class CustomSignale extends Signale {
  constructor() {
    super({
      config: { underlineLabel: false }
    })

    defaultCommands.forEach(([key, prefix]) => this.addPrefix(key, prefix))
  }

  public startGroup(title: string) {
    process.stdout.write(`::group::${title}`)
  }

  public endGroup() {
    process.stdout.write('::endgroup::')
  }

  private addPrefix(key: DefaultMethods, prefix: string): void {
    if (!this[key])
      throw `Can't extend ${key} method, base function does not exist`

    const method = this[key]

    this[key] = (...args: any[]) => {
      let message, options

      if (
        args.length == 1 &&
        typeof args[0] == 'object' &&
        !!args[0] &&
        !(args[0] instanceof Error)
      ) {
        // The method has been called using only one config argument
        // logger.error({ message: 'abc', ... })
        options = args[0]
      } else {
        // The method has been called using message + options
        // logger.error('abc', { ... })
        message = args[0]
        options = args[1]
      }

      if (!options) options = {}
      if (message) options = { ...options, message }
      return options.noIssue ? method(...args) : method({ prefix, ...options })
    }
  }
}
