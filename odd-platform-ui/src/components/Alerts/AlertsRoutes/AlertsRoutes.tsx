import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  fetchAllAlertList,
  fetchMyAlertList,
  fetchMyDependentsAlertList,
} from 'redux/thunks';
import { useAppPaths } from 'lib/hooks';
import AlertsList from '../AlertsList/AlertsList';

const AlertsRoutes: React.FC = () => {
  const { AlertsRoutes: AlertsRoutesEnum } = useAppPaths();

  return (
    <Routes>
      <Route
        path={AlertsRoutesEnum.all}
        element={<AlertsList fetchAlerts={fetchAllAlertList} />}
      />
      <Route
        path={AlertsRoutesEnum.my}
        element={<AlertsList fetchAlerts={fetchMyAlertList} />}
      />
      <Route
        path={AlertsRoutesEnum.dependents}
        element={<AlertsList fetchAlerts={fetchMyDependentsAlertList} />}
      />
      <Route path='/' element={<Navigate to={AlertsRoutesEnum.all} replace />} />
    </Routes>
  );
};

export default AlertsRoutes;
