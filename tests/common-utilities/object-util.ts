/**
 *
 * @param obj
 * @param keys
 */
export function objHasKeys<T extends object>(obj: T, keys: string[]) {
  const next = keys.shift();

  return obj[next] && (!keys.length || objHasKeys(obj[next], keys));
}

export const keyify = <T>(obj: T, prefix = ''): string[] =>
  Object.entries(obj).reduce((collector, [key, val]) => {
    const newKeys = [...collector, prefix ? `${prefix}.${key}` : key];

    if (
      Object.prototype.toString.call(val) === '[object Object]' ||
      Object.prototype.toString.call(val) === '[object Array]'
    ) {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      const otherKeys = keyify(val, newPrefix);

      return [...newKeys, ...otherKeys];
    }
    return newKeys;
  }, []);
