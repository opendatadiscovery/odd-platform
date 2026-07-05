import React from 'react';
import { useTranslation } from 'react-i18next';
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

/**
 * ST-4 (#1838) — the /search result tabs. The seven per-entity-class tabs (Datasets / Transformers / Data
 * Consumers / Data Inputs / Quality Tests / Groups / Relationships) are RETIRED — class/kind selection is now
 * the Asset-type sidebar filter. Only All and My Objects remain. My-Objects retirement + the My-data filter is
 * a later slice (ST-8), so the existing My-Objects control stays here unchanged; it still writes `?my=` and
 * narrows the (now cross-kind) results to the current user's owned entities.
 */
const SearchResultsTabs: React.FC<SearchResultsTabsProps> = ({
  showTabsSkeleton,
  isHintUpdating,
  totals,
  searchClass,
  onSearchClassChange,
}) => {
  const { t } = useTranslation();
  const [tabs, setTabs] = React.useState<AppTabItem<SearchClass>[]>([]);

  React.useEffect(() => {
    setTabs([
      { name: t('All'), hint: totals.all, value: 'all' },
      { name: t('My Objects'), hint: totals.myObjectsTotal, value: 'my' },
    ]);
  }, [totals, t]);

  const [selectedTab, setSelectedTab] = React.useState<number>(0);

  // My Objects is index 1; everything else — All, or an entity-class narrowing chosen in the Asset-type
  // filter — keeps the All tab (index 0) active (a class narrowing is a refinement of All, not of My).
  React.useEffect(() => {
    setSelectedTab(searchClass === 'my' ? 1 : 0);
  }, [searchClass]);

  const onTabChange = (newTabIndex: number) => {
    onSearchClassChange(tabs[newTabIndex]?.value);
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
