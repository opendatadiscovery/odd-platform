import React, { type FC, useCallback, useMemo, useState, useEffect } from 'react';
import { matchPath, useLocation, useNavigate, useResolvedPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCreateSearch, useQueryParams } from 'lib/hooks';
import {
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/elements/Activity/common';
import { useAppDispatch } from 'redux/lib/hooks';
import { createTermSearch } from 'redux/thunks';
import AppTabs, { type AppTabItem } from 'components/shared/elements/AppTabs/AppTabs';
import {
  activityPath,
  alertsPath,
  dataEntitiesPath,
  dataQualityPath,
  directoryPath,
  lookupTablesPath,
  managementPath,
  queryExamplesPath,
  searchPath,
  termsSearchPath,
} from 'routes';

const ToolbarTabs: FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createSearch = useCreateSearch();
  const { pathname } = useResolvedPath(useLocation());
  const { defaultQueryString: activityQueryString } =
    useQueryParams<ActivityQuery>(defaultActivityQuery);

  const tabs = useMemo<AppTabItem<string>[]>(
    () => [
      {
        name: t('Catalog'),
        link: searchPath(),
      },
      {
        name: t('Directory'),
        link: directoryPath(),
        value: 'directory',
      },
      {
        name: t('Data Quality'),
        link: dataQualityPath(),
        value: 'data-quality',
      },
      {
        name: t('Data Modelling'),
        link: queryExamplesPath(),
        value: 'data-modelling',
      },
      {
        name: t('Master Data'),
        link: lookupTablesPath(),
        value: 'master-data',
      },
      {
        name: t('Management'),
        link: managementPath(),
        value: 'management',
      },
      {
        name: t('Dictionary'),
        link: termsSearchPath(),
        value: 'dictionary',
      },
      {
        name: t('Alerts'),
        link: alertsPath('all'),
        value: 'alerts',
      },
      {
        name: t('Activity'),
        link: activityPath(activityQueryString),
        value: 'activity',
      },
    ],
    [activityQueryString, t]
  );

  const [selectedTab, setSelectedTab] = useState(-1);

  useEffect(() => {
    if (matchPath('/', pathname)) {
      setSelectedTab(-1);
      return;
    }

    if (
      matchPath(`${searchPath()}/*`, pathname) ||
      matchPath(`${dataEntitiesPath()}/*`, pathname)
    ) {
      setSelectedTab(0);
      return;
    }

    tabs.forEach((tab, idx) => {
      if (tab.value && pathname.includes(tab.value)) {
        setSelectedTab(idx);
      }
    });
  }, [pathname]);

  const handleTabClick = useCallback(
    (idx: number) => {
      const initialParams = { query: '', pageSize: 30, filters: {} };

      if (tabs[idx].name === t('Dictionary')) {
        dispatch(createTermSearch({ termSearchFormData: initialParams }))
          .unwrap()
          .then(({ searchId }) => {
            const termSearchLink = termsSearchPath(searchId);
            navigate(termSearchLink);
          });
        return;
      }

      if (tabs[idx].name === t('Catalog') && tabs[idx].link?.includes('search')) {
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
