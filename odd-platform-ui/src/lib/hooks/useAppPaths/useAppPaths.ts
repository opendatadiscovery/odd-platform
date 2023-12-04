import { useMemo } from 'react';
import { useIsEmbeddedPath } from './useIsEmbeddedPath';
import { useTermsPaths } from './useTermsPaths';
import { useDataEntityPaths } from './useDataEntityPaths';
import { ActivityRoutes, SearchRoutes, TermsRoutes, DataEntityRoutes } from './shared';

const useAppPaths = () => {
  const { updatePath, isPathEmbedded } = useIsEmbeddedPath();
  const termsPaths = useTermsPaths();
  const dataEntityPaths = useDataEntityPaths();

  const getNonExactPath = (path: string) => updatePath(`${path}/*`);
  const getNonExactParamPath = (path: string) => `${path}/*`;

  const basePath = updatePath('');

  // search
  const baseSearchPath = () => `${SearchRoutes.search}`;
  const searchPath = (searchId: string = SearchRoutes.searchIdParam) =>
    updatePath(`${baseSearchPath()}/${searchId}`);

  // Activity
  const activityPath = (query?: string) => {
    const queryStr = `?${query}`;
    return updatePath(`${ActivityRoutes.activity}${query ? queryStr : ''}`);
  };

  return useMemo(
    () => ({
      isPathEmbedded,
      ActivityRoutes,
      SearchRoutes,
      TermsRoutes,
      DataEntityRoutes,
      basePath,
      updatePath,
      getNonExactPath,
      getNonExactParamPath,
      searchPath,
      activityPath,
      ...termsPaths,
      ...dataEntityPaths,
    }),
    [isPathEmbedded, termsPaths, dataEntityPaths]
  );
};

export default useAppPaths;
