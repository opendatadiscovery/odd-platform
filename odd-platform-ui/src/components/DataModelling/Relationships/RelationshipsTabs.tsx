import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { RelationshipsType } from 'generated-sources';
import React, { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const RelationshipsTabs = () => {
  const tabs = useMemo<AppTabItem<RelationshipsType>[]>(
    () => [
      {
        name: 'All',
        value: RelationshipsType.ALL,
      },
      {
        name: 'ERD',
        value: RelationshipsType.ERD,
      },
      {
        name: 'Graph',
        value: RelationshipsType.GRAPH,
      },
    ],
    []
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const findInitTabIdx = useCallback(() => {
    const type = searchParams.get('type') ?? RelationshipsType.ALL;
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
