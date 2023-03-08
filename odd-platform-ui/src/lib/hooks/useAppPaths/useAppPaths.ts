import React from 'react';
import { useIsEmbeddedPath } from './useIsEmbeddedPath';
import { useManagementPaths } from './useManagementPaths';
import { useTermsPaths } from './useTermsPaths';
import { useDataEntityPaths } from './useDataEntityPaths';
import {
  BaseRoutes,
  ActivityRoutes,
  SearchRoutes,
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

  const getNonExactPath = (path: string) => updatePath(`${path}/*`);

  const basePath = updatePath(BaseRoutes.base);

  // search
  const baseSearchPath = () => updatePath(`/${SearchRoutes.search}`);
  const searchPath = (searchId: string = SearchRoutes.searchIdParam) =>
    `${baseSearchPath()}/${searchId}`;

  // Activity
  const activityPath = (query?: string) =>
    updatePath(`/${ActivityRoutes.activity}${query ? `?${query}` : ''}`);

  return React.useMemo(
    () => ({
      isPathEmbedded,
      BaseRoutes,
      ActivityRoutes,
      SearchRoutes,
      AlertsRoutes,
      ManagementRoutes,
      TermsRoutes,
      DataEntityRoutes,
      basePath,
      baseSearchPath,
      getNonExactPath,
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
