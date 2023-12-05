import { useMemo } from 'react';
import { useIsEmbeddedPath } from './useIsEmbeddedPath';
import { ActivityRoutes, TermsRoutes } from './shared';

const useAppPaths = () => {
  const { updatePath, isPathEmbedded } = useIsEmbeddedPath();

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
      TermsRoutes,
      updatePath,
      getNonExactPath,
      getNonExactParamPath,
      activityPath,
    }),
    [isPathEmbedded]
  );
};

export default useAppPaths;
