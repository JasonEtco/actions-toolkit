import 'signale'

declare module 'signale' {
  interface SignaleBase<TTypes extends string = DefaultMethods> {
    public disable (): void
  }
}
