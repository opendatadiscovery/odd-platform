import { useMemo } from 'react';
import { useIsEmbeddedPath } from './useIsEmbeddedPath';
import { useTermsPaths } from './useTermsPaths';
import { ActivityRoutes, SearchRoutes, TermsRoutes } from './shared';

const useAppPaths = () => {
  const { updatePath, isPathEmbedded } = useIsEmbeddedPath();
  const termsPaths = useTermsPaths();

  const getNonExactPath = (path: string) => updatePath(`${path}/*`);
  const getNonExactParamPath = (path: string) => `${path}/*`;

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
      updatePath,
      getNonExactPath,
      getNonExactParamPath,
      activityPath,
      ...termsPaths,
    }),
    [isPathEmbedded, termsPaths]
  );
};

export default useAppPaths;
