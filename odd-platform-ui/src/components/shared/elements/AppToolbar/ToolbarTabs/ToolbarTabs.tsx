import React, { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppPaths, useCreateSearch, useQueryParams } from 'lib/hooks';
import {
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/elements/Activity/common';
import { useAppDispatch } from 'redux/lib/hooks';
import { createTermSearch } from 'redux/thunks';
import AppTabs, { type AppTabItem } from 'components/shared/elements/AppTabs/AppTabs';
import {
  alertsPath,
  dataQualityPath,
  directoryPath,
  managementPath,
  queryExamplesPath,
} from 'routes';

const ToolbarTabs: FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const createSearch = useCreateSearch();
  const { defaultQueryString: activityQueryString } =
    useQueryParams<ActivityQuery>(defaultActivityQuery);

  const {
    activityPath,
    termSearchPath,
    TermsRoutes,
    SearchRoutes,
    ActivityRoutes,
    DataEntityRoutes,
    updatePath,
  } = useAppPaths();

  const tabs = useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Catalog'),
        link: updatePath(SearchRoutes.search),
        value: SearchRoutes.search,
      },
      {
        name: t('Directory'),
        link: updatePath(directoryPath()),
        value: 'directory',
      },
      {
        name: t('Data Quality'),
        link: updatePath(dataQualityPath()),
        value: 'data-quality',
      },
      {
        name: t('Data Modelling'),
        link: updatePath(queryExamplesPath()),
        value: 'data-modelling',
        hint: t('BETA'),
        hintType: 'secondary',
      },
      {
        name: t('Management'),
        link: updatePath(managementPath('namespaces')),
        value: 'management',
      },
      {
        name: t('Dictionary'),
        link: updatePath(TermsRoutes.termSearch),
        value: TermsRoutes.termSearch,
      },
      {
        name: t('Alerts'),
        link: updatePath(alertsPath('all')),
        value: 'alerts',
      },
      {
        name: t('Activity'),
        link: activityPath(activityQueryString),
        value: ActivityRoutes.activity,
      },
    ],
    [activityQueryString, t, updatePath]
  );

  const [selectedTab, setSelectedTab] = useState(-1);

  useEffect(() => {
    let newTabIdx = -1;
    tabs.forEach((tab, idx) => {
      if (
        location.pathname.includes(tab.value as string) &&
        !location.pathname.includes(DataEntityRoutes.dataentities)
      ) {
        newTabIdx = idx;
      }
    });

    setSelectedTab(newTabIdx);
  }, [tabs, location]);

  const handleTabClick = useCallback(
    (idx: number) => {
      setSelectedTab(idx);

      const initialParams = { query: '', pageSize: 30, filters: {} };

      if (tabs[idx].name === t('Dictionary')) {
        dispatch(createTermSearch({ termSearchFormData: initialParams }))
          .unwrap()
          .then(termSearch => {
            const termSearchLink = termSearchPath(termSearch.searchId);
            navigate(termSearchLink);
          });
        return;
      }

      if (
        tabs[idx].name === t('Catalog') &&
        tabs[idx].link?.includes(SearchRoutes.search)
      ) {
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
