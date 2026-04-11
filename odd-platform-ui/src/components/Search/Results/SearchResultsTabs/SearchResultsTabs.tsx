import React from 'react';
import { DataEntityClassNameEnum } from 'generated-sources';
import type { SearchClass, SearchTotalsByName } from 'redux/interfaces';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import SearchTabsSkeleton from './SearchTabsSkeleton/SearchTabsSkeleton';

interface SearchResultsTabsProps {
  showTabsSkeleton: boolean;
  isHintUpdating: boolean;
  totals: SearchTotalsByName;
  searchClass: SearchClass;
  onSearchClassChange: (tabValue: SearchClass | undefined) => void;
}

const SearchResultsTabs: React.FC<SearchResultsTabsProps> = ({
  showTabsSkeleton,
  isHintUpdating,
  totals,
  searchClass,
  onSearchClassChange,
}) => {
  const [tabs, setTabs] = React.useState<AppTabItem<SearchClass>[]>([]);

  React.useEffect(() => {
    setTabs([
      { name: 'All', hint: totals.all, value: 'all' },
      { name: 'My Objects', hint: totals.myObjectsTotal, value: 'my' },
      {
        name: 'Datasets',
        hint: totals[DataEntityClassNameEnum.SET]?.count || 0,
        value: totals[DataEntityClassNameEnum.SET]?.id,
      },
      {
        name: 'Transformers',
        hint: totals[DataEntityClassNameEnum.TRANSFORMER]?.count || 0,
        value: totals[DataEntityClassNameEnum.TRANSFORMER]?.id,
      },
      {
        name: 'Data Consumers',
        hint: totals[DataEntityClassNameEnum.CONSUMER]?.count || 0,
        value: totals[DataEntityClassNameEnum.CONSUMER]?.id,
      },
      {
        name: 'Data Inputs',
        hint: totals[DataEntityClassNameEnum.INPUT]?.count || 0,
        value: totals[DataEntityClassNameEnum.INPUT]?.id,
      },
      {
        name: 'Quality Tests',
        hint: totals[DataEntityClassNameEnum.QUALITY_TEST]?.count || 0,
        value: totals[DataEntityClassNameEnum.QUALITY_TEST]?.id,
      },
      {
        name: 'Groups',
        hint: totals[DataEntityClassNameEnum.ENTITY_GROUP]?.count || 0,
        value: totals[DataEntityClassNameEnum.ENTITY_GROUP]?.id,
      },
      {
        name: 'Relationships',
        hint: totals[DataEntityClassNameEnum.RELATIONSHIP]?.count || 0,
        value: totals[DataEntityClassNameEnum.RELATIONSHIP]?.id,
      },
    ]);
  }, [totals]);

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

  React.useEffect(() => {
    setSelectedTab(searchClass ? tabs.findIndex(tab => tab.value === searchClass) : 0);
  }, [tabs, searchClass]);

  const onTabChange = (newTabIndex: number) => {
    const tabValue = tabs[newTabIndex].value;
    onSearchClassChange(tabValue);
  };

  return (
    <>
      {showTabsSkeleton ? (
        <SearchTabsSkeleton length={tabs.length} />
      ) : (
        <AppTabs
          type='primary'
          items={tabs}
          selectedTab={selectedTab}
          handleTabChange={onTabChange}
          isHintUpdating={isHintUpdating}
        />
      )}
    </>
  );
};

export default SearchResultsTabs;
