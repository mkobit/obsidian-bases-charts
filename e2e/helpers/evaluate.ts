import type { App } from 'obsidian'
import type { Page } from '@playwright/test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function evaluateObsidian<T>(page: Page, fn: (app: App) => T | Promise<T>): Promise<any> {
  const fnSrc = fn.toString()

  return page.evaluate((src) => {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fnObj = new Function(`return (${src})`)()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return fnObj((window as any).app)
  }, fnSrc)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function evaluateObsidianWith<T, A>(page: Page, fn: (app: App, args: A) => T | Promise<T>, args: A): Promise<any> {
  const fnSrc = fn.toString()

  return page.evaluate(([src, fnArgs]) => {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fnObj = new Function(`return (${src})`)()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return fnObj((window as any).app, fnArgs)
  }, [fnSrc, args] as const)
}
