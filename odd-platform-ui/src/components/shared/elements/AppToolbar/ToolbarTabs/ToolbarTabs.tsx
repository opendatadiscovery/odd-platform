import React, { type FC, useCallback, useMemo, useState } from 'react';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';
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
  searchPath,
} from 'routes';
import useSetSelectedTab from '../../AppTabs/useSetSelectedTab';

const ToolbarTabs: FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createSearch = useCreateSearch();
  const { defaultQueryString: activityQueryString } =
    useQueryParams<ActivityQuery>(defaultActivityQuery);

  const { activityPath, termSearchPath, TermsRoutes, updatePath } = useAppPaths();
  const match = useMatch(useLocation().pathname);

  const tabs = useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Catalog'),
        link: searchPath(),
      },
      {
        name: t('Directory'),
        link: updatePath(directoryPath()),
      },
      {
        name: t('Data Quality'),
        link: updatePath(dataQualityPath()),
      },
      {
        name: t('Data Modelling'),
        link: updatePath(queryExamplesPath()),
        hint: t('BETA'),
        hintType: 'secondary',
      },
      {
        name: t('Management'),
        link: updatePath(managementPath()),
      },
      {
        name: t('Dictionary'),
        link: updatePath(TermsRoutes.termSearch),
      },
      {
        name: t('Alerts'),
        link: updatePath(alertsPath('all')),
      },
      {
        name: t('Activity'),
        link: activityPath(activityQueryString),
      },
    ],
    [activityQueryString, t, updatePath]
  );

  const [selectedTab, setSelectedTab] = useState(-1);

  useSetSelectedTab(tabs, match, setSelectedTab);

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
