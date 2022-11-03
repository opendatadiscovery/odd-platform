import React from 'react';
import { AppTabItem, AppTabs } from 'components/shared';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { getTermDetails } from 'redux/selectors';
import { useAppSelector } from 'redux/lib/hooks';

const TermDetailsTabs: React.FC = () => {
  const { termId, viewType } = useAppParams();
  const { termDetailsOverviewPath, termDetailsLinkedItemsPath } = useAppPaths();

  const termDetails = useAppSelector(getTermDetails(termId));

  const [tabs, setTabs] = React.useState<AppTabItem[]>([]);

  React.useEffect(() => {
    setTabs([
      {
        name: 'Overview',
        link: termDetailsOverviewPath(termId),
        value: 'overview',
      },
      {
        name: 'Linked items',
        link: termDetailsLinkedItemsPath(termId),
        hint: termDetails?.entitiesUsingCount,
        hidden: !termDetails?.entitiesUsingCount,
        value: 'linked-items',
      },
    ]);
  }, [termId, termDetails?.entitiesUsingCount]);

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

  React.useEffect(() => {
    setSelectedTab(viewType ? tabs.findIndex(tab => tab.value === viewType) : 0);
  }, [tabs, viewType]);

  return (
    <>
      {tabs.length && selectedTab >= 0 && (
        <AppTabs
          type='primary'
          items={tabs}
          selectedTab={selectedTab}
          handleTabChange={() => {}}
          sx={{ mt: 2 }}
        />
      )}
    </>
  );
};

export default TermDetailsTabs;
