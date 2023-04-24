import React from 'react';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { changeAlertsFilterAction } from 'redux/slices/alerts.slice';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import type { AlertTotals } from 'generated-sources';

interface AlertsTabsProps {
  totals: AlertTotals;
  showMyAndDepends: boolean;
}

const AlertsTabs: React.FC<AlertsTabsProps> = ({ totals, showMyAndDepends }) => {
  const dispatch = useAppDispatch();
  const { alertsViewType } = useAppParams();
  const { AlertsRoutes } = useAppPaths();

  const [selectedTab, setSelectedTab] = React.useState(-1);

  const tabs = React.useMemo<AppTabItem[]>(
    () => [
      {
        name: 'All',
        hint: totals?.total || 0,
        value: AlertsRoutes.all,
        link: AlertsRoutes.all,
      },
      {
        name: 'My Objects',
        hint: totals?.myTotal || 0,
        value: AlertsRoutes.my,
        link: AlertsRoutes.my,
        hidden: !showMyAndDepends,
      },
      {
        name: 'Dependents',
        hint: totals?.dependentTotal || 0,
        value: AlertsRoutes.dependents,
        link: AlertsRoutes.dependents,
        hidden: !showMyAndDepends,
      },
    ],
    [totals, showMyAndDepends]
  );

  React.useEffect(() => {
    setSelectedTab(
      alertsViewType ? tabs.findIndex(tab => tab.value === alertsViewType) : 0
    );
  }, [tabs, alertsViewType]);

  const alertsFilterUpdateAction = React.useCallback(() => {
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
