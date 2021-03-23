import { Signale, DefaultMethods } from 'signale'

export class CustomSignale extends Signale {
  constructor() {
    super({
      config: { underlineLabel: false }
    })

    this.addPrefix('error', '::error::')
    this.addPrefix('fatal', '::error::')
    this.addPrefix('warn', '::warning::')
    this.addPrefix('debug', '::debug::')
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
      if (
        args.length == 1 &&
        typeof args[0] == 'object' &&
        !!args[0] &&
        !(args[0] instanceof Error)
      ) {
        // The method has been called using only one config argument
        // logger.error({ message: 'abc', ... })
        return args[0].noIssue
          ? method(...args)
          : method({ prefix, ...args[0] })
      } else {
        // The method has been called using message + options
        // logger.error('abc', { ... })
        return args[1].noIssue
          ? method(...args)
          : method(args[0], { prefix, ...(args[1] ?? {}) })
      }
    }
  }
}
