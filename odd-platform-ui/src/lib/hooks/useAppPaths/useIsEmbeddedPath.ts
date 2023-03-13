import React from 'react';
import { useLocation } from 'react-router-dom';
import { EMBEDDED } from './shared';

export const useIsEmbeddedPath = () => {
  const location = useLocation();
  const isPathEmbedded = location.pathname.includes(EMBEDDED);

  const updatePath = React.useCallback(
    (link: string) => {
      if (isPathEmbedded) return `/${EMBEDDED}/${link}`;
      return `/${link}`;
    },
    [isPathEmbedded]
  );

  return React.useMemo(
    () => ({ isPathEmbedded, updatePath }),
    [isPathEmbedded, updatePath]
  );
};
