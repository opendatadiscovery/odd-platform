import React from 'react';
import {
  Alert,
  DataEntityApiGetDataEntityAlertsRequest,
  AlertApiChangeAlertStatusRequest,
  AlertList,
  AlertStatus,
} from 'generated-sources';
import { Box } from '@mui/material';
import AlertBanner from './AlertBanner/AlertBanner';

interface AlertBannersProps {
  dataEntityId: number;
  alerts: Alert[];
  fetchDataEntityAlerts: (
    params: DataEntityApiGetDataEntityAlertsRequest
  ) => Promise<AlertList>;
  updateAlertStatus: (
    params: AlertApiChangeAlertStatusRequest
  ) => Promise<AlertStatus>;
}

const AlertBanners: React.FC<AlertBannersProps> = ({
  dataEntityId,
  alerts,
  fetchDataEntityAlerts,
  updateAlertStatus,
}) => {
  React.useEffect(() => {
    fetchDataEntityAlerts({ dataEntityId });
  }, []);

  const resolveAlertHandler = React.useCallback(
    (alertId: Alert['id']) => () => {
      updateAlertStatus({
        alertId,
        alertStatusFormData: { status: AlertStatus.RESOLVED },
      });
    },
    [updateAlertStatus]
  );

  return alerts?.length ? (
    <Box sx={{ mt: 2 }}>
      {alerts?.map(alert => (
        <AlertBanner
          sx={{ mt: 1.25 }}
          key={alert.id}
          alert={alert}
          resolveAlert={resolveAlertHandler(alert.id)}
        />
      ))}
    </Box>
  ) : null;
};

export default AlertBanners;
