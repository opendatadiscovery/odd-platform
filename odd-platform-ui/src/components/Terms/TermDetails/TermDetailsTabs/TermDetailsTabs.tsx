import React from 'react';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { getTermDetails } from 'redux/selectors';
import { useAppSelector } from 'redux/lib/hooks';

const TermDetailsTabs: React.FC = () => {
  const { termId, termsViewType } = useAppParams();
  const { termDetailsOverviewPath, termDetailsLinkedItemsPath, TermsRoutes } =
    useAppPaths();

  const termDetails = useAppSelector(getTermDetails(termId));

  const tabs = React.useMemo<AppTabItem[]>(
    () => [
      {
        name: 'Overview',
        link: termDetailsOverviewPath(termId),
        value: TermsRoutes.overview,
      },
      {
        name: 'Linked items',
        link: termDetailsLinkedItemsPath(termId),
        hint: termDetails?.entitiesUsingCount,
        hidden: !termDetails?.entitiesUsingCount,
        value: TermsRoutes.linkedItems,
      },
    ],
    [termId, termDetails?.entitiesUsingCount]
  );

  const [selectedTab, setSelectedTab] = React.useState(-1);

  React.useEffect(() => {
    setSelectedTab(
      termsViewType ? tabs.findIndex(tab => tab.value === termsViewType) : 0
    );
  }, [tabs, termsViewType]);

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
