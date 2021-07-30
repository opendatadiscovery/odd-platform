import { Grid, Typography } from '@material-ui/core';
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import cx from 'classnames';
import {
  DataEntityRef,
  AlertTotals,
  AlertList,
  AlertApiGetAllAlertsRequest,
  AlertApiGetAssociatedUserAlertsRequest,
  AlertApiGetDependentEntitiesAlertsRequest,
} from 'generated-sources';
import { AlertViewType } from 'redux/interfaces/alert';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import { StylesType } from './AlertsStyles';
import AlertsListContainer from './AlertsList/AlertsListContainer';
import { alertsPath } from '../../lib/paths';

interface AlertsProps extends StylesType {
  totals: AlertTotals;
  viewType: string;
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
        variant="primary"
        classes={{ container: classes.tabsContainer }}
        items={tabs}
        selectedTab={selectedTab}
        handleTabChange={() => {}}
      />
      <Switch>
        <Route
          exact
          path="/alerts/all"
          render={() => (
            <AlertsListContainer fetchAlerts={fetchAllAlertList} />
          )}
        />
        <Route
          exact
          path="/alerts/my"
          render={() => (
            <AlertsListContainer fetchAlerts={fetchMyAlertList} />
          )}
        />
        <Route
          exact
          path="/alerts/dependents"
          render={() => (
            <AlertsListContainer
              fetchAlerts={fetchMyDependentsAlertList}
            />
          )}
        />
        <Redirect from="/alerts" to="/alerts/all" />
      </Switch>
    </div>
  );
};

export default Alerts;
