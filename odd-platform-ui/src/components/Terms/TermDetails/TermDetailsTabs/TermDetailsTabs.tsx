import React from 'react';
import { useTranslation } from 'react-i18next';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { getTermDetails } from 'redux/selectors';
import { useAppSelector } from 'redux/lib/hooks';

const TermDetailsTabs: React.FC = () => {
  const { t } = useTranslation();
  const { termId, termsViewType } = useAppParams();
  const {
    termDetailsOverviewPath,
    termDetailsLinkedEntitiesPath,
    termDetailsLinkedColumnsPath,
    TermsRoutes,
  } = useAppPaths();

  const termDetails = useAppSelector(getTermDetails(termId));

  const tabs = React.useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Overview'),
        link: termDetailsOverviewPath(termId),
        value: TermsRoutes.overview,
      },
      {
        name: t('Linked entities'),
        link: termDetailsLinkedEntitiesPath(termId),
        hint: termDetails?.entitiesUsingCount,
        hidden: !termDetails?.entitiesUsingCount,
        value: TermsRoutes.linkedEntities,
      },
      {
        name: t('Linked columns'),
        link: termDetailsLinkedColumnsPath(termId),
        hint: termDetails?.entitiesUsingCount,
        hidden: !termDetails?.entitiesUsingCount,
        value: TermsRoutes.linkedColumns,
      },
    ],
    [termId, termDetails?.entitiesUsingCount, t]
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
