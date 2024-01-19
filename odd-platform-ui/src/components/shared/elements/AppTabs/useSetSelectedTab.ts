import type React from 'react';
import { useCallback, useEffect } from 'react';
import { useLocation, useResolvedPath } from 'react-router-dom';
import type { AppTabItem } from './AppTabs';

const useSetSelectedTab = (
  tabs: AppTabItem[],
  setSelectedTab: React.Dispatch<React.SetStateAction<number>>
) => {
  const { pathname } = useResolvedPath(useLocation());

  const findTabIndex = useCallback(
    () =>
      tabs.findIndex(({ link }) => {
        if (link) return pathname.includes(link) || link.includes(pathname);
        return false;
      }),
    [tabs, pathname]
  );

  useEffect(() => setSelectedTab(findTabIndex()), [tabs, pathname]);
};

export default useSetSelectedTab;
