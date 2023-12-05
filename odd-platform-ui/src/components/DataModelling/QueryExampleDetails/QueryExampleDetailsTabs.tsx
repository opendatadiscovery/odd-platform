import { useTranslation } from 'react-i18next';
import React, { useMemo } from 'react';
import type { AppTabItem } from 'components/shared/elements';
import { AppTabs } from 'components/shared/elements';

interface QueryExampleDetailsTabsProps {
  onHandleTabChange: () => void;
  linkedEntitiesHint?: number | string;
  selectedTab?: number;
}

const QueryExampleDetailsTabs = ({
  linkedEntitiesHint,
  selectedTab,
  onHandleTabChange,
}: QueryExampleDetailsTabsProps) => {
  const { t } = useTranslation();

  const tabs = useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Overview'),
      },
      {
        name: t('Linked Entities'),
        hint: linkedEntitiesHint,
      },
    ],
    [t, linkedEntitiesHint]
  );

  return (
    <AppTabs
      type='primary'
      items={tabs}
      selectedTab={selectedTab}
      handleTabChange={onHandleTabChange}
    />
  );
};

export default QueryExampleDetailsTabs;
