import React from 'react';
import { useLocation } from 'react-router-dom';

export const useIsEmbeddedPath = () => {
  const location = useLocation();
  const isPathEmbedded = location.pathname.includes('embedded');
  const updatePath = (link: string) => {
    if (isPathEmbedded) return `/embedded${link}`;
    return link;
  };

  return React.useMemo(() => ({ isPathEmbedded, updatePath }), [isPathEmbedded]);
};
