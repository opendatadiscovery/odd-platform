import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { getTermDetails } from 'redux/selectors';
import { useAppSelector } from 'redux/lib/hooks';
import { termDetailsPath, useTermsRouteParams } from 'routes';
import useSetSelectedTab from 'components/shared/elements/AppTabs/useSetSelectedTab';

const TermDetailsTabs: React.FC = () => {
  const { t } = useTranslation();
  const { termId } = useTermsRouteParams();
  const termDetails = useAppSelector(getTermDetails(termId));

  const tabs = useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Overview'),
        link: termDetailsPath(termId),
      },
      {
        name: t('Linked entities'),
        link: termDetailsPath(termId, 'linked-entities'),
        hint: termDetails?.entitiesUsingCount,
        hidden: !termDetails?.entitiesUsingCount,
      },
      {
        name: t('Linked columns'),
        link: termDetailsPath(termId, 'linked-columns'),
        hint: termDetails?.columnsUsingCount,
        hidden: !termDetails?.columnsUsingCount,
      },
      {
        name: 'Linked terms',
        link: termDetailsPath(termId, 'linked-terms'),
        hint: termDetails?.linkedTermsUsingCount,
        hidden: !termDetails?.linkedTermsUsingCount,
      },
      {
        name: 'Query examples',
        link: termDetailsPath(termId, 'query-examples'),
      },
    ],
    [termId, termDetails?.entitiesUsingCount, termDetails?.columnsUsingCount, t]
  );

  const selectedTab = useSetSelectedTab(tabs);

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
