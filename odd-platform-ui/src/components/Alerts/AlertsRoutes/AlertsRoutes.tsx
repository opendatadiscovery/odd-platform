import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  fetchAllAlertList,
  fetchMyAlertList,
  fetchMyDependentsAlertList,
} from 'redux/thunks';
import AlertsList from '../AlertsList/AlertsList';

const AlertsRoutes: React.FC = () => (
  <Routes>
    <Route path='all' element={<AlertsList fetchAlerts={fetchAllAlertList} />} />
    <Route path='my' element={<AlertsList fetchAlerts={fetchMyAlertList} />} />
    <Route
      path='dependents'
      element={<AlertsList fetchAlerts={fetchMyDependentsAlertList} />}
    />
    <Route path='/' element={<Navigate to='all' replace />} />
  </Routes>
);

export default AlertsRoutes;
