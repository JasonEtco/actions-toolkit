declare module 'flat-cache' {
  export interface Cache {
    all (): any
    setKey (key: string, value: any): void
    getKey (key: string): any
    removeKey (key: string): void
    save (noPrune?: boolean): void
    keys (): string[]
  }

  export function load (id: string, path?: string): Cache
  export function clearCacheById(id: string): void
  export function clearAll(): void
}