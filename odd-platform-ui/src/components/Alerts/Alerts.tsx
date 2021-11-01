import { Typography } from '@mui/material';
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import {
  AlertTotals,
  AlertList,
  AlertApiGetAllAlertsRequest,
  AlertApiGetAssociatedUserAlertsRequest,
  AlertApiGetDependentEntitiesAlertsRequest,
} from 'generated-sources';
import { alertsPath } from 'lib/paths';
import { AlertViewType } from 'redux/interfaces/alert';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import { StylesType } from './AlertsStyles';
import AlertsListContainer from './AlertsList/AlertsListContainer';

interface AlertsProps extends StylesType {
  totals: AlertTotals;
  viewType: string;
  alertsFilterUpdateAction: () => void;
  fetchAlertsTotals: () => Promise<AlertTotals>;
  fetchAllAlertList: (
    params: AlertApiGetAllAlertsRequest
  ) => Promise<AlertList>;
  fetchMyAlertList: (
    params: AlertApiGetAssociatedUserAlertsRequest
  ) => Promise<AlertList>;
  fetchMyDependentsAlertList: (
    params: AlertApiGetDependentEntitiesAlertsRequest
  ) => Promise<AlertList>;
}

const Alerts: React.FC<AlertsProps> = ({
  classes,
  viewType,
  totals,
  alertsFilterUpdateAction,
  fetchAlertsTotals,
  fetchAllAlertList,
  fetchMyAlertList,
  fetchMyDependentsAlertList,
}) => {
  React.useEffect(() => {
    fetchAlertsTotals();
  }, []);

  const tabs: AppTabItem<AlertViewType>[] = [
    {
      name: 'All',
      hint: totals?.total || 0,
      value: 'all',
      link: alertsPath('all'),
    },
    {
      name: 'My Objects',
      hint: totals?.myTotal || 0,
      value: 'my',
      link: alertsPath('my'),
    },
    {
      name: 'Dependents',
      hint: totals?.dependentTotal || 0,
      value: 'dependents',
      link: alertsPath('dependents'),
    },
  ];

  const [selectedTab] = React.useState<number>(() =>
    viewType ? tabs.findIndex(tab => tab.value === viewType) : 0
  );

  return (
    <div className={classes.container}>
      <Typography variant="h1" className={classes.caption}>
        Alerts
      </Typography>
      <AppTabs
        type="primary"
        items={tabs}
        selectedTab={selectedTab}
        handleTabChange={alertsFilterUpdateAction}
      />
      <Switch>
        <Route
          exact
          path={alertsPath('all')}
          render={() => (
            <AlertsListContainer fetchAlerts={fetchAllAlertList} />
          )}
        />
        <Route
          exact
          path={alertsPath('my')}
          render={() => (
            <AlertsListContainer fetchAlerts={fetchMyAlertList} />
          )}
        />
        <Route
          exact
          path={alertsPath('dependents')}
          render={() => (
            <AlertsListContainer
              fetchAlerts={fetchMyDependentsAlertList}
            />
          )}
        />
        <Redirect from="/alerts" to={alertsPath()} />
      </Switch>
    </div>
  );
};

export default Alerts;
