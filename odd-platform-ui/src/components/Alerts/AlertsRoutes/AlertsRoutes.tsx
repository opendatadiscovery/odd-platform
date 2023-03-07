import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom-v5-compat';
import {
  fetchAllAlertList,
  fetchMyAlertList,
  fetchMyDependentsAlertList,
} from 'redux/thunks';
import { useAppPaths } from 'lib/hooks';
import AlertsList from '../AlertsList/AlertsList';

const AlertsRoutes: React.FC = () => {
  const { alertsPath, AlertsRoutes: AlertsRoutesEnum, alertsBasePath } = useAppPaths();

  return (
    <Routes>
      <Route
        path={alertsPath(AlertsRoutesEnum.all)}
        element={<AlertsList fetchAlerts={fetchAllAlertList} />}
      />
      <Route
        path={alertsPath(AlertsRoutesEnum.my)}
        element={<AlertsList fetchAlerts={fetchMyAlertList} />}
      />
      <Route
        path={alertsPath(AlertsRoutesEnum.dependents)}
        element={<AlertsList fetchAlerts={fetchMyDependentsAlertList} />}
      />
      <Route path={alertsBasePath()} element={<Navigate to={alertsPath()} replace />} />
    </Routes>
  );
};

export default AlertsRoutes;
