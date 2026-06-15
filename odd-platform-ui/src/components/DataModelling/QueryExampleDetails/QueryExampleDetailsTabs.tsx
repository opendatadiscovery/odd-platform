import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppTabItem } from 'components/shared/elements';
import { AppTabs } from 'components/shared/elements';
import { useSearchParams } from 'react-router-dom';

interface QueryExampleDetailsTabsProps {
  linkedEntitiesHint?: number | string;
  linkedTermsHint?: number | string;
}

const QueryExampleDetailsTabs = ({
  linkedEntitiesHint,
  linkedTermsHint,
}: QueryExampleDetailsTabsProps) => {
  const { t } = useTranslation();
  const tabs = useMemo<AppTabItem<string>[]>(
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
      {
        name: t('Linked Terms'),
        value: 'linked-terms',
        hint: linkedTermsHint,
      },
    ],
    [linkedEntitiesHint, linkedTermsHint, t]
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const findInitTabIdx = useCallback(() => {
    const type = searchParams.get('tab') ?? 'overview';
    return tabs.findIndex(tab => tab.value === type);
  }, [searchParams, tabs]);

  const initialTabIdx = useMemo(() => findInitTabIdx(), [findInitTabIdx, searchParams]);

  const onTabChange = useCallback(
    (newTab: number) => {
      const type = tabs[newTab].value;
      if (type) {
        const params = new URLSearchParams(searchParams);
        params.set('tab', type);
        setSearchParams(params);
      }
    },
    [searchParams, tabs]
  );

  return (
    <AppTabs
      type='primary'
      items={tabs}
      selectedTab={initialTabIdx}
      handleTabChange={onTabChange}
    />
  );
};

export default QueryExampleDetailsTabs;
