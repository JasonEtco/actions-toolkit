import 'signale'

declare module 'signale' {
  interface SignaleBase<TTypes extends string = DefaultMethods> {
    disable (): void
    enable (): void
    isEnabled (): boolean
    addSecrets (secrets: any[]): void
    clearSecrets (): void
  }
}
