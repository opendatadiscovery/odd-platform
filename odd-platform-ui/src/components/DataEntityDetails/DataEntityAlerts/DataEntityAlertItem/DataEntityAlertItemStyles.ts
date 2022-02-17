import { Grid } from '@mui/material';
import { ColContainer } from 'components/DataEntityDetails/DataEntityAlerts/DataEntityAlertsStyles';
import styled from 'styled-components';

export const ActionButtonsContainer = styled(ColContainer)(() => ({
  opacity: 0,
}));

export const Container = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1.25, 0),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
    [`${ActionButtonsContainer}`]: {
      opacity: 1,
    },
  },
}));
