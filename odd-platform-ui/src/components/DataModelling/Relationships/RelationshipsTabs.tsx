import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { RelationshipsType } from 'generated-sources';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { parseRelationshipsType } from './parseRelationshipsType';

const RelationshipsTabs = () => {
  const { t } = useTranslation();
  const tabs = useMemo<AppTabItem<RelationshipsType>[]>(
    () => [
      {
        name: t('All'),
        value: RelationshipsType.ALL,
      },
      {
        name: 'ERD',
        value: RelationshipsType.ERD,
      },
      {
        name: t('Graph'),
        value: RelationshipsType.GRAPH,
      },
    ],
    [t]
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const findInitTabIdx = useCallback(() => {
    const type = parseRelationshipsType(searchParams.get('type'));
    return tabs.findIndex(tab => tab.value === type);
  }, [searchParams, tabs]);

  const initialTabIdx = useMemo(() => findInitTabIdx(), [findInitTabIdx, searchParams]);

  const onTabChange = useCallback(
    (newTab: number) => {
      const type = tabs[newTab].value;
      if (type) {
        const params = new URLSearchParams(searchParams);
        params.set('type', type);
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

export default RelationshipsTabs;
