import { generatePath } from 'react-router-dom';

const AlertsRoutes = {
  BASE_PATH: 'alerts',
  ALL_PATH: `all`,
  MY_PATH: `my`,
  DEPENDENTS_PATH: `dependents`,
} as const;

type AlertsRoutesType = typeof AlertsRoutes;

export function alertsPath(path?: AlertsRoutesType[keyof AlertsRoutesType]) {
  if (!path) return generatePath(AlertsRoutes.BASE_PATH);
  return generatePath(`${AlertsRoutes.BASE_PATH}/${path}`);
}
