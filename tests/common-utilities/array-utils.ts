/**
 * Gets a unique list of objects by key
 * @param arr
 * @param key
 * @returns
 */
export function get_unique_list_by(arr: Record<string, any>[], key: string) {
  return [...new Map(arr.map(item => [item[key], item])).values()];
}
