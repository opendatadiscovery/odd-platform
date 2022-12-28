import React from 'react';
import { useAppPaths, useQueryParams } from 'lib/hooks';
import {
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/Activity/common';
import { useAppDispatch } from 'redux/lib/hooks';
import { AppTabs, type AppTabItem } from 'components/shared/index';
import { createDataEntitiesSearch, createTermSearch } from 'redux/thunks';
import { useHistory, useLocation } from 'react-router-dom';

const ToolbarTabs: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const history = useHistory();
  const { defaultQueryString: activityQueryString } =
    useQueryParams<ActivityQuery>(defaultActivityQuery);
  const { activityPath, termSearchPath, searchPath } = useAppPaths();

  const [tabs, setTabs] = React.useState<AppTabItem[]>([]);

  React.useEffect(() => {
    setTabs([
      { name: 'Catalog', link: '/search', value: 'search' },
      { name: 'Management', link: '/management', value: 'management' },
      { name: 'Dictionary', link: '/termsearch', value: 'termsearch' },
      { name: 'Alerts', link: '/alerts', value: 'alerts' },
      { name: 'Activity', link: activityPath(activityQueryString), value: 'activity' },
    ]);
  }, [activityQueryString]);

  const [selectedTab, setSelectedTab] = React.useState(-1);

  React.useEffect(() => {
    let newTabIdx = -1;
    tabs.forEach((tab, idx) => {
      if (
        location.pathname.includes(tab.value as string) &&
        !location.pathname.includes('dataentities')
      )
        newTabIdx = idx;
    });

    setSelectedTab(newTabIdx);
  }, [tabs, location]);

  const handleTabClick = React.useCallback(
    (idx: number) => {
      setSelectedTab(idx);

      const initialParams = { query: '', pageSize: 30, filters: {} };

      if (tabs[idx].name === 'Dictionary') {
        dispatch(createTermSearch({ termSearchFormData: initialParams }))
          .unwrap()
          .then(termSearch => {
            const termSearchLink = termSearchPath(termSearch.searchId);
            history.replace(termSearchLink);
          });
        return;
      }

      if (tabs[idx].name === 'Catalog') {
        dispatch(createDataEntitiesSearch({ searchFormData: initialParams }))
          .unwrap()
          .then(({ searchId }) => {
            const searchLink = searchPath(searchId);
            history.replace(searchLink);
          });
      }
    },
    [tabs, history]
  );

  return (
    <AppTabs
      type='menu'
      items={tabs}
      selectedTab={selectedTab}
      handleTabChange={handleTabClick}
    />
  );
};

export default ToolbarTabs;
