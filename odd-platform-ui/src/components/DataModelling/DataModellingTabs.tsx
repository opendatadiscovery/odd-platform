import type { AppTabItem } from 'components/shared/elements';
import { AppTabs } from 'components/shared/elements';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { queryExamplesPath } from 'routes';

const DataModellingTabs = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Query Examples'),
        link: queryExamplesPath(),
      },
    ],
    [t]
  );
  const handleTabChange = useCallback(() => {
    setSelectedTab(prev => (prev === 0 ? 1 : 0));
  }, []);

  return (
    <AppTabs
      type='menu'
      orientation='vertical'
      items={tabs}
      selectedTab={selectedTab}
      handleTabChange={handleTabChange}
    />
  );
};

export default DataModellingTabs;
