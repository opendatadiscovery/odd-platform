export const titleWithoutTags = (title: string) => title.replace(/(@\w+)(?:\W\d+)*/gi, '').trim();
export const testName = (titlePath: string[]) =>
  titlePath
    .filter(nonEmpty => nonEmpty.length > 0)
    .map(titleWithoutTags)
    .join(`_`)
    .replace(/[\s+_/\\.]/gi, '_')
    .toLowerCase();
