import React from 'react';
import {
  Alert,
  DataEntityApiGetDataEntityAlertsRequest,
  AlertApiChangeAlertStatusRequest,
  AlertList,
  AlertStatus,
} from 'generated-sources';
import { StylesType } from './AlertBannersStyles';
import AlertBanner from './AlertBanner/AlertBanner';

interface AlertBannersProps extends StylesType {
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
  classes,
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
    <div className={classes.container}>
      {alerts?.map(alert => (
        <AlertBanner
          key={alert.id}
          alert={alert}
          resolveAlert={resolveAlertHandler(alert.id)}
        />
      ))}
    </div>
  ) : null;
};

export default AlertBanners;
