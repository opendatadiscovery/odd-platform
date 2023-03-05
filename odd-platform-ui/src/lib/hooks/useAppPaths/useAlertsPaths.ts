import { useIsEmbeddedPath } from './useIsEmbeddedPath';
import { AlertsRoutes } from './shared';

export const useAlertsPaths = () => {
  const { updatePath } = useIsEmbeddedPath();

  const alertsBasePath = () => updatePath(`/${AlertsRoutes.alerts}`);
  const alertsPath = (viewType: AlertsRoutes = AlertsRoutes.all) =>
    `${alertsBasePath()}/${viewType}`;

  return { alertsBasePath, alertsPath };
};
