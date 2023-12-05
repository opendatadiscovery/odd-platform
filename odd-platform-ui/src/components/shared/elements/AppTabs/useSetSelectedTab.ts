import type React from 'react';
import { useEffect } from 'react';
import { useLocation, useResolvedPath } from 'react-router-dom';
import type { AppTabItem } from './AppTabs';

const useSetSelectedTab = (
  tabs: AppTabItem[],
  setSelectedTab: React.Dispatch<React.SetStateAction<number>>
) => {
  const resolvedPath = useResolvedPath(useLocation().pathname);
  useEffect(() => {
    const foundIndex = tabs.findIndex(({ link }) => {
      const { pathname } = resolvedPath;
      return link ? pathname.includes(link) || link.includes(pathname) : false;
    });
    setSelectedTab(foundIndex);
  }, [tabs, resolvedPath]);
};

export default useSetSelectedTab;
