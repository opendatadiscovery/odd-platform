import React, { type FC, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  dataQualityPath,
  directoryPath,
  lookupTablesPath,
  managementPath,
  queryExamplesPath,
  searchPath,
  termsSearchPath,
} from 'routes';
import useSetSelectedTab from '../../AppTabs/useSetSelectedTab';

const ToolbarTabs: FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createSearch = useCreateSearch();
  const { defaultQueryString: activityQueryString } =
    useQueryParams<ActivityQuery>(defaultActivityQuery);

  const tabs = useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Catalog'),
        link: searchPath(),
      },
      {
        name: t('Directory'),
        link: directoryPath(),
      },
      {
        name: t('Data Quality'),
        link: dataQualityPath(),
      },
      {
        name: t('Data Modelling'),
        link: queryExamplesPath(),
        hint: t('BETA'),
        hintType: 'secondary',
      },
      {
        name: t('Master Data'),
        link: lookupTablesPath(),
      },
      {
        name: t('Management'),
        link: managementPath(),
      },
      {
        name: t('Dictionary'),
        link: termsSearchPath(),
      },
      {
        name: t('Alerts'),
        link: alertsPath('all'),
      },
      {
        name: t('Activity'),
        link: activityPath(activityQueryString),
      },
    ],
    [activityQueryString, t]
  );

  const [selectedTab, setSelectedTab] = useState(-1);

  useSetSelectedTab(tabs, setSelectedTab);

  const handleTabClick = useCallback(
    (idx: number) => {
      setSelectedTab(idx);

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
