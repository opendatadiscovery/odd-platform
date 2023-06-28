import React from 'react';
import { Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchAlertsTotals } from 'redux/thunks';
import { getAlertsTotals, getOwnership } from 'redux/selectors';
import { ListLayout } from 'components/shared/elements';
import { useTranslation } from 'react-i18next';
import AlertsTabs from './AlertsTabs/AlertsTabs';
import AlertsRoutes from './AlertsRoutes/AlertsRoutes';

const Alerts: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(fetchAlertsTotals());
  }, []);

  const totals = useAppSelector(getAlertsTotals);
  const showMyAndDepends = useAppSelector(getOwnership);

  return (
    <ListLayout>
      <Typography variant='h1' sx={{ mb: 2.75 }}>
        {t('Alerts')}
      </Typography>
      <AlertsTabs totals={totals} showMyAndDepends={!!showMyAndDepends} />
      <AlertsRoutes />
    </ListLayout>
  );
};

export default Alerts;
