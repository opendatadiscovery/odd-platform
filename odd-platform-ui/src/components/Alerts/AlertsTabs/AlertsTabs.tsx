import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { changeAlertsFilterAction } from 'redux/slices/alerts.slice';
import { useAppDispatch } from 'redux/lib/hooks';
import type { AlertTotals } from 'generated-sources';
import { alertsPath } from 'routes';
import useSetSelectedTab from 'components/shared/elements/AppTabs/useSetSelectedTab';

interface AlertsTabsProps {
  totals: AlertTotals;
  showMyAndDepends: boolean;
}

const AlertsTabs: React.FC<AlertsTabsProps> = ({ totals, showMyAndDepends }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const tabs = useMemo<AppTabItem[]>(
    () => [
      {
        name: t('All'),
        hint: totals?.total ?? 0,
        link: alertsPath('all'),
      },
      {
        name: t('My Objects'),
        hint: totals?.myTotal ?? 0,
        link: alertsPath('my'),
        hidden: !showMyAndDepends,
      },
      {
        name: t('Dependents'),
        hint: totals?.dependentTotal ?? 0,
        link: alertsPath('dependents'),
        hidden: !showMyAndDepends,
      },
    ],
    [totals, showMyAndDepends, t]
  );

  const selectedTab = useSetSelectedTab(tabs);

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
