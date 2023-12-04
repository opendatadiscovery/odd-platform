import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { changeAlertsFilterAction } from 'redux/slices/alerts.slice';
import { useAppDispatch } from 'redux/lib/hooks';
import type { AlertTotals } from 'generated-sources';
import { useIsEmbeddedPath } from 'lib/hooks/useAppPaths/useIsEmbeddedPath';
import { alertsPath } from 'routes';
import { useLocation, useMatch } from 'react-router-dom';
import useSetSelectedTab from 'components/shared/elements/AppTabs/useSetSelectedTab';

interface AlertsTabsProps {
  totals: AlertTotals;
  showMyAndDepends: boolean;
}

const AlertsTabs: React.FC<AlertsTabsProps> = ({ totals, showMyAndDepends }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { updatePath } = useIsEmbeddedPath();
  const match = useMatch(useLocation().pathname);

  const [selectedTab, setSelectedTab] = useState(-1);

  const tabs = useMemo<AppTabItem[]>(
    () => [
      {
        name: t('All'),
        hint: totals?.total ?? 0,
        link: updatePath(alertsPath('all')),
      },
      {
        name: t('My Objects'),
        hint: totals?.myTotal ?? 0,
        link: updatePath(alertsPath('my')),
        hidden: !showMyAndDepends,
      },
      {
        name: t('Dependents'),
        hint: totals?.dependentTotal ?? 0,
        link: updatePath(alertsPath('dependents')),
        hidden: !showMyAndDepends,
      },
    ],
    [totals, showMyAndDepends, t]
  );

  useSetSelectedTab(tabs, match, setSelectedTab);

  const alertsFilterUpdateAction = useCallback(() => {
    dispatch(changeAlertsFilterAction());
  }, []);

  return (
    <AppTabs
      type='primary'
      items={tabs}
      selectedTab={selectedTab}
      handleTabChange={alertsFilterUpdateAction}
    />
  );
};

export default AlertsTabs;
