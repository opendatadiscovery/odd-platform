// @ts-ignore
export function obj_has_keys<T extends object>(obj: T, keys: string[]) {
  const next = keys.shift();

  // @ts-ignore
  return obj[next] && (!keys.length || obj_has_keys(obj[next], keys));
}

export const keyify = <T>(obj: T, prefix = ''): string[] =>
  // @ts-ignore
  Object.entries(obj).reduce((collector, [key, val]) => {
    const new_keys = [...collector, prefix ? `${prefix}.${key}` : key];

    if (
      Object.prototype.toString.call(val) === '[object Object]' ||
      Object.prototype.toString.call(val) === '[object Array]'
    ) {
      const new_prefix = prefix ? `${prefix}.${key}` : key;
      const other_keys = keyify(val, new_prefix);

      return [...new_keys, ...other_keys];
    }
    return new_keys;
  }, []);
