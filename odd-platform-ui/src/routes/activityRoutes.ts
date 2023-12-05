const BASE_PATH = '/activity';

export function activityPath(query?: string) {
  const queryStr = `?${query}`;
  return `${BASE_PATH}${query ? queryStr : ''}`;
}
