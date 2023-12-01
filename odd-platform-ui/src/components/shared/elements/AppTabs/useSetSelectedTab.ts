import type React from 'react';
import { useEffect } from 'react';
import type { PathMatch } from 'react-router-dom';
import type { AppTabItem } from './AppTabs';

const useSetSelectedTab = (
  tabs: AppTabItem[],
  match: PathMatch | null,
  setSelectedTab: React.Dispatch<React.SetStateAction<number>>
) => {
  useEffect(() => {
    const foundIndex = tabs.findIndex(({ link }) => {
      const pathname = match?.pathname;
      return link && pathname
        ? pathname.includes(link) || link.includes(pathname)
        : false;
    });
    setSelectedTab(foundIndex === -1 ? 0 : foundIndex);
  }, [tabs, match]);
};

export default useSetSelectedTab;
