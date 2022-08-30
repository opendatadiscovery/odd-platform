export const title_without_tags = (title: string) => title.replace(/(@\w+)(?:\W\d+)*/gi, '').trim();
export const test_name = (title_path: string[]) =>
  title_path
    .filter(non_empty => non_empty.length > 0)
    .map(title_without_tags)
    .join(`_`)
    .replace(/[\s+_/\\.]/gi, '_')
    .toLowerCase();
