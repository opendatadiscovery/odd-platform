import type { AppTabItem } from 'components/shared/elements';
import { AppTabs } from 'components/shared/elements';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { queryExamplesPath, relationshipsPath } from 'routes';
import useSetSelectedTab from 'components/shared/elements/AppTabs/useSetSelectedTab';

const DataModellingTabs = () => {
  const { t } = useTranslation();

  const tabs = useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Query Examples'),
        link: queryExamplesPath(),
      },
      {
        name: t('Relationships'),
        link: relationshipsPath(),
      },
    ],
    [t]
  );

  const selectedTab = useSetSelectedTab(tabs);

  return (
    <AppTabs type='menu' orientation='vertical' items={tabs} selectedTab={selectedTab} />
  );
};

export default DataModellingTabs;
