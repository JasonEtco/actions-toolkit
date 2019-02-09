// tslint:disable:no-console

/**
 * The code to exit an action with a "success" state
 */
export const SuccessCode = 0
/**
 * The code to exit an action with a "failure" state
 */
export const FailureCode = 1
/**
 * The code to exit an action with a "neutral" state
 */
export const NeutralCode = 78

export class Exit {
  /**
   * Stop the action with a "success" status
   */
  public success (message?: string) {
    if (message) console.log(message)
    process.exit(SuccessCode)
  }

  /**
   * Stop the action with a "neutral" status
   */
  public neutral (message?: string) {
    if (message) console.log(message)
    process.exit(NeutralCode)
  }

  /**
   * Stop the action with a "failed" status
   */
  public failure (message?: string) {
    if (message) console.error(message)
    process.exit(FailureCode)
  }
}
