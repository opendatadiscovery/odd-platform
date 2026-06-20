const BASE_PATH = '/alerts';

// The alerts surface is a single query-param-tab page (mirrors Activity); the tab lives in
// `?type=...`, not in the path, so there are no per-tab sub-routes.
export function alertsPath() {
  return BASE_PATH;
}
