import { Grid, Typography } from '@material-ui/core';
import React from 'react';
import {
  Alert,
  DataEntityApiGetDataEntityAlertsRequest,
} from 'generated-sources';
import { StylesType } from './AlertBannersStyles';
import AlertBanner from './AlertBanner/AlertBanner';

interface AlertBannersProps extends StylesType {
  dataEntityId: number;
  alerts: Alert[];
  fetchDataEntityAlerts: (
    params: DataEntityApiGetDataEntityAlertsRequest
  ) => void;
}

const AlertBanners: React.FC<AlertBannersProps> = ({
  classes,
  dataEntityId,
  alerts,
  fetchDataEntityAlerts,
}) => {
  React.useEffect(() => {
    fetchDataEntityAlerts({ dataEntityId });
  }, []);

  return alerts?.length ? (
    <div className={classes.container}>
      {alerts?.map(alert => (
        <AlertBanner key={alert.id} alert={alert} />
      ))}
    </div>
  ) : null;
};

export default AlertBanners;
