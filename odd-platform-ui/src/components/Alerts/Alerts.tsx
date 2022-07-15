import { Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import {
  fetchAlertsTotals,
  fetchAllAlertList,
  fetchMyAlertList,
  fetchMyDependentsAlertList,
} from 'redux/thunks';
import { getAlertTotals } from 'redux/selectors';
import { changeAlertsFilterAction } from 'redux/reducers/alerts.slice';
import { alertsPath } from 'lib/paths';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import { useAppParams } from 'lib/hooks/hooks';
import { AlertViewType } from 'lib/interfaces';
import * as S from './AlertsStyles';
import AlertsList from './AlertsList/AlertsList';

const Alerts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { viewType } = useAppParams();
  const totals = useAppSelector(getAlertTotals);
  React.useEffect(() => {
    dispatch(fetchAlertsTotals());
  }, [fetchAlertsTotals]);

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

  const alertsFilterUpdateAction = useCallback(() => {
    dispatch(changeAlertsFilterAction());
  }, [changeAlertsFilterAction]);

  return (
    <S.Container>
      <Typography variant="h1" sx={{ mb: 2.75 }}>
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
          render={() => <AlertsList fetchAlerts={fetchAllAlertList} />}
        />
        <Route
          exact
          path={alertsPath('my')}
          render={() => <AlertsList fetchAlerts={fetchMyAlertList} />}
        />
        <Route
          exact
          path={alertsPath('dependents')}
          render={() => (
            <AlertsList fetchAlerts={fetchMyDependentsAlertList} />
          )}
        />
        <Redirect from="/alerts" to={alertsPath()} />
      </Switch>
    </S.Container>
  );
};

export default Alerts;
