import React from 'react';
import { useAppPaths, useQueryParams } from 'lib/hooks';
import {
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/Activity/common';
import { useAppDispatch } from 'redux/lib/hooks';
import { createDataEntitiesSearch, createTermSearch } from 'redux/thunks';
import { useNavigate, useLocation } from 'react-router-dom-v5-compat';
import AppTabs, { type AppTabItem } from 'components/shared/AppTabs/AppTabs';

const ToolbarTabs: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { defaultQueryString: activityQueryString } =
    useQueryParams<ActivityQuery>(defaultActivityQuery);
  const {
    activityPath,
    termSearchPath,
    searchPath,
    ManagementRoutes,
    AlertsRoutes,
    TermsRoutes,
    baseTermSearchPath,
    SearchRoutes,
    ActivityRoutes,
    DataEntityRoutes,
  } = useAppPaths();

  const tabs = React.useMemo<AppTabItem[]>(
    () => [
      { name: 'Catalog', link: SearchRoutes.search, value: SearchRoutes.search },
      {
        name: 'Management',
        link: ManagementRoutes.management,
        value: ManagementRoutes.management,
      },
      {
        name: 'Dictionary',
        link: baseTermSearchPath(),
        value: TermsRoutes.termSearch,
      },
      { name: 'Alerts', link: AlertsRoutes.alerts, value: AlertsRoutes.alerts },
      {
        name: 'Activity',
        link: activityPath(activityQueryString),
        value: ActivityRoutes.activity,
      },
    ],
    [activityQueryString]
  );

  const [selectedTab, setSelectedTab] = React.useState(-1);

  React.useEffect(() => {
    let newTabIdx = -1;
    tabs.forEach((tab, idx) => {
      if (
        location.pathname.includes(tab.value as string) &&
        !location.pathname.includes(DataEntityRoutes.dataentities)
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
            navigate(termSearchLink);
          });
        return;
      }

      if (tabs[idx].name === 'Catalog') {
        dispatch(createDataEntitiesSearch({ searchFormData: initialParams }))
          .unwrap()
          .then(({ searchId }) => {
            const searchLink = searchPath(searchId);
            navigate(searchLink);
          });
      }
    },
    [tabs]
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
