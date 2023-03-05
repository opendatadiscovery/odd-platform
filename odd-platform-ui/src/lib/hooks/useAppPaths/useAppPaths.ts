import React from 'react';
import { useIsEmbeddedPath } from './useIsEmbeddedPath';
import { useManagementPaths } from './useManagementPaths';
import { useTermsPaths } from './useTermsPaths';
import { useDataEntityPaths } from './useDataEntityPaths';
import {
  AppRoutes,
  AlertsRoutes,
  ManagementRoutes,
  TermsRoutes,
  DataEntityRoutes,
} from './shared';
import { useAlertsPaths } from './useAlertsPaths';

const useAppPaths = () => {
  const { updatePath, isPathEmbedded } = useIsEmbeddedPath();
  const managementPaths = useManagementPaths();
  const termsPaths = useTermsPaths();
  const alertsPaths = useAlertsPaths();
  const dataEntityPaths = useDataEntityPaths();

  const basePath = updatePath('/');

  // search
  const baseSearchPath = () => updatePath(`/${AppRoutes.search}`);
  const searchPath = (searchId: string = AppRoutes.searchId) =>
    `${baseSearchPath()}/${searchId}`;

  // Activity
  const activityPath = (query?: string) =>
    updatePath(`/${AppRoutes.activity}${query ? `?${query}` : ''}`);

  return React.useMemo(
    () => ({
      isPathEmbedded,
      AppRoutes,
      AlertsRoutes,
      ManagementRoutes,
      TermsRoutes,
      DataEntityRoutes,
      basePath,
      baseSearchPath,
      searchPath,
      activityPath,
      ...managementPaths,
      ...termsPaths,
      ...alertsPaths,
      ...dataEntityPaths,
    }),
    [isPathEmbedded, managementPaths, termsPaths, alertsPaths, dataEntityPaths]
  );
};

export default useAppPaths;
