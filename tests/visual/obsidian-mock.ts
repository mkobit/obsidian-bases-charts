export class Notice {}
export class Plugin {}
export class ItemView {}
export const Platform = { isMobile: true }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean,
): (...args: Parameters<T>) => void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/no-let
  let timeout: any

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (this: any, ...args: Parameters<T>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-this-alias
    const context = this

    const later = function () {
      timeout = null
      if (!immediate) {
        func.apply(context, args)
      }
    }

    const callNow = immediate && !timeout
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    clearTimeout(timeout)

    timeout = setTimeout(later, wait)

    if (callNow) {
      func.apply(context, args)
    }
  }
}
