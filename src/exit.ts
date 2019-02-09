// tslint:disable:no-console

export class Exit {
  /**
   * The code to exit an action with a "success" state
   */
  public SuccessCode: number
  /**
   * The code to exit an action with a "failure" state
   */
  public FailureCode: number
  /**
   * The code to exit an action with a "neutral" state
   */
  public NeutralCode: number

  constructor () {
    this.SuccessCode = 0
    this.FailureCode = 1
    this.NeutralCode = 78
  }

  /**
   * Stop the action with a "success" status
   */
  public success (message?: string) {
    if (message) console.log(message)
    process.exit(this.SuccessCode)
  }

  /**
   * Stop the action with a "neutral" status
   */
  public neutral (message?: string) {
    if (message) console.log(message)
    process.exit(this.NeutralCode)
  }

  /**
   * Stop the action with a "failed" status
   */
  public failure (message?: string) {
    if (message) console.error(message)
    process.exit(this.FailureCode)
  }
}
