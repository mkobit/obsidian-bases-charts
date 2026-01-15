/* eslint-disable functional/no-classes */
/* eslint-disable functional/prefer-immutable-types */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/functional-parameters */
/* eslint-disable functional/no-this-expressions */
/* eslint-disable functional/no-expression-statements */
/* eslint-disable functional/no-conditional-statements */

export class Notice {}
export class Plugin {}
export class ItemView {}
// eslint-disable-next-line functional/no-let, prefer-const
export let Platform = { isMobile: false }

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    timeout = setTimeout(later, wait)

    if (callNow) {
      func.apply(context, args)
    }
  }
}
