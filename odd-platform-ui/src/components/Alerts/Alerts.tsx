import React from 'react';
import { Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchAlertsTotals } from 'redux/thunks';
import { getAlertsTotals, getOwnership } from 'redux/selectors';
import * as S from './AlertsStyles';
import AlertsTabs from './AlertsTabs/AlertsTabs';
import AlertsRoutes from './AlertsRoutes/AlertsRoutes';

const Alerts: React.FC = () => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(fetchAlertsTotals());
  }, []);

  const totals = useAppSelector(getAlertsTotals);
  const showMyAndDepends = useAppSelector(getOwnership);

  return (
    <S.Container>
      <Typography variant='h1' sx={{ mb: 2.75 }}>
        Alerts
      </Typography>
      <AlertsTabs totals={totals} showMyAndDepends={!!showMyAndDepends} />
      <AlertsRoutes />
    </S.Container>
  );
};

export default Alerts;
