import { useCallback, useEffect, useState } from 'react';
import { useLocation, useResolvedPath } from 'react-router-dom';
import type { AppTabItem } from './AppTabs';

const useSetSelectedTab = (tabs: AppTabItem[]) => {
  const { pathname } = useResolvedPath(useLocation());
  const [selectedTab, setSelectedTab] = useState(0);

  const findTabIndex = useCallback(
    () =>
      tabs.findIndex(({ link }) => {
        if (link) return pathname.includes(link) || link.includes(pathname);
        return false;
      }),
    [tabs, pathname]
  );

  useEffect(() => setSelectedTab(findTabIndex()), [tabs, pathname]);

  return selectedTab;
};

export default useSetSelectedTab;
