import { generatePath } from 'react-router-dom';

const BASE_PATH = 'alerts';
const AlertsRoutes = {
  ALL_PATH: `all`,
  MY_PATH: `my`,
  DEPENDENTS_PATH: `dependents`,
} as const;

type AlertsRoutesType = typeof AlertsRoutes;

export function alertsPath(path?: AlertsRoutesType[keyof AlertsRoutesType]) {
  if (!path) return generatePath(BASE_PATH);
  return generatePath(`${BASE_PATH}/${path}`);
}
