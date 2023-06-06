import React from 'react';
import { useAppPaths, useCreateSearch, useQueryParams } from 'lib/hooks';
import {
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/elements/Activity/common';
import { useAppDispatch } from 'redux/lib/hooks';
import { createTermSearch } from 'redux/thunks';
import { useLocation, useNavigate } from 'react-router-dom';
import AppTabs, { type AppTabItem } from 'components/shared/elements/AppTabs/AppTabs';

const ToolbarTabs: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const createSearch = useCreateSearch();
  const { defaultQueryString: activityQueryString } =
    useQueryParams<ActivityQuery>(defaultActivityQuery);

  const {
    activityPath,
    termSearchPath,
    ManagementRoutes,
    AlertsRoutes,
    TermsRoutes,
    SearchRoutes,
    ActivityRoutes,
    DirectoryRoutes,
    DataEntityRoutes,
    updatePath,
  } = useAppPaths();

  const tabs = React.useMemo<AppTabItem[]>(
    () => [
      {
        name: 'Catalog',
        link: updatePath(SearchRoutes.search),
        value: SearchRoutes.search,
      },
      {
        name: 'Directory',
        link: updatePath(DirectoryRoutes.directory),
        value: DirectoryRoutes.directory,
      },
      {
        name: 'Management',
        link: updatePath(ManagementRoutes.management),
        value: ManagementRoutes.management,
      },
      {
        name: 'Dictionary',
        link: updatePath(TermsRoutes.termSearch),
        value: TermsRoutes.termSearch,
      },
      {
        name: 'Alerts',
        link: updatePath(AlertsRoutes.alerts),
        value: AlertsRoutes.alerts,
      },
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
        createSearch(initialParams);
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
