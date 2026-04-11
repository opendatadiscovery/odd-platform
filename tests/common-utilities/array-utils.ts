/**
 * Gets a unique list of objects by key
 *
 * @param arr
 * @param key
 * @returns
 */
export function getUniqueListBy(arr: Record<string, any>[], key: string) {
  return [...new Map(arr.map(item => [item[key], item])).values()];
}
