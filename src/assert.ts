import { Exit } from './exit'

export class Assert {
  public exit: Exit

  constructor (exit: Exit) {
    this.exit = exit
  }

  public assert = this.isTrue

  /**
   * Assert condition and exit with "failed" status if it's met
   */
  public isTrue(condition: any, msg?: string): asserts condition {
    if (condition) {
      this.exit.failure(msg ?? `Assertion for value ${condition} is true`)
    }
  }

  /**
   * Assert condition and exit with "failed" status if it's not met
   */
  public isFalse(condition: any, msg?: string): asserts condition {
    if (!condition) {
      this.exit.failure(msg ?? `Assertion for value ${condition} is false`)
    }
  }
}
