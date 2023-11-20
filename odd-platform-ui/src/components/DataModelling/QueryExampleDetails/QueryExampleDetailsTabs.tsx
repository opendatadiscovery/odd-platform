import { useTranslation } from 'react-i18next';
import React, { useCallback, useMemo, useState } from 'react';
import type { AppTabItem } from 'components/shared/elements';
import { AppTabs } from 'components/shared/elements';

interface QueryExampleDetailsTabsProps {
  linkedEntitiesHint?: number | string;
}

const QueryExampleDetailsTabs = ({
  linkedEntitiesHint,
}: QueryExampleDetailsTabsProps) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Overview'),
        value: 'overview',
      },
      {
        name: t('Linked Entities'),
        value: 'linked-entities',
        hint: linkedEntitiesHint,
      },
    ],
    [t]
  );
  const handleTabChange = useCallback(() => {
    setSelectedTab(prev => (prev === 0 ? 1 : 0));
  }, []);

  return (
    <AppTabs
      type='primary'
      items={tabs}
      selectedTab={selectedTab}
      handleTabChange={handleTabChange}
    />
  );
};

export default QueryExampleDetailsTabs;
