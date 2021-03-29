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

    defaultCommands.forEach(([key, prefix]) => this.replaceMethod(key, prefix))
  }

  public startGroup(title: string) {
    process.stdout.write(`::group::${title}\n`)
  }

  public endGroup() {
    process.stdout.write('::endgroup::\n')
  }

  private replaceMethod(key: DefaultMethods, prefix: string): void {
    if (!this[key])
      throw `Can't extend ${key} method, base function does not exist`

    const method = this[key]

    this[key] = (...args: any[]) => {
      let options

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
        // The method has been called using message + arguments
        // logger.error('abc %s', 'def', ...)
      }

      // Unless the user wants to use the original method...
      if (!options?.noIssue) {
        // Write the gh prefix to stdout
        process.stdout.write(prefix)

        // Run the default log method
        return this.log(...args)
      } else {
        // Run the original method
        return method(...args)
      }
    }
  }
}
