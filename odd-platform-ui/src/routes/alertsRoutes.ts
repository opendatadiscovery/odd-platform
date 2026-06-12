const BASE_PATH = '/alerts';
export const AlertsRoutes = {
  ALL_PATH: `all`,
  MY_PATH: `my`,
  DEPENDENTS_PATH: `dependents`,
} as const;

type AlertsRoutesType = typeof AlertsRoutes;

export function alertsPath(path?: AlertsRoutesType[keyof AlertsRoutesType]) {
  if (!path) return BASE_PATH;
  return `${BASE_PATH}/${path}`;
}
