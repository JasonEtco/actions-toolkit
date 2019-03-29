import 'signale'

declare module 'signale' {
  interface SignaleBase<TTypes extends string = DefaultMethods> {
    /**
     * Disables the logging functionality of all loggers belonging to a specific instance.
     */
    disable(): void;
    /**
     * Enables the logging functionality of all loggers belonging to a specific instance.
     */
    enable(): void;
    /**
     * Checks whether the logging functionality of a specific instance is enabled.
     *
     * @returns a boolean that describes whether or not the logger is enabled.
     */
    isEnabled(): boolean;
    /**
     * Adds new secrets/sensitive-information to the targeted Signale instance.
     *
     * @param secrets Array holding the secrets/sensitive-information to be filtered out.
     */
    addSecrets(secrets: string[] | number[]): void;
    /**
     * Removes all secrets/sensitive-information from the targeted Signale instance.
     */
    clearSecrets(): void;
  }
}
