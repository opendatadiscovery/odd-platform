import { useMemo } from 'react';
import { useIsEmbeddedPath } from './useIsEmbeddedPath';
import { useTermsPaths } from './useTermsPaths';
import { ActivityRoutes, SearchRoutes, TermsRoutes } from './shared';

const useAppPaths = () => {
  const { updatePath, isPathEmbedded } = useIsEmbeddedPath();
  const termsPaths = useTermsPaths();

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
      basePath,
      updatePath,
      getNonExactPath,
      getNonExactParamPath,
      searchPath,
      activityPath,
      ...termsPaths,
    }),
    [isPathEmbedded, termsPaths]
  );
};

export default useAppPaths;
