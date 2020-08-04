import { Exit } from './exit'

export class Assert {
  private exit: Exit

  constructor (exit: Exit) {
    this.exit = exit
  }

  /**
   * Assert condition is truthy and exit with "failed" status if not
   */
  public isTruthy(condition: any, msg?: string): asserts condition {
    if (!condition) {
      this.exit.failure(msg ?? `Assertion for value ${condition} is not truthy`)
    }
  }
}
