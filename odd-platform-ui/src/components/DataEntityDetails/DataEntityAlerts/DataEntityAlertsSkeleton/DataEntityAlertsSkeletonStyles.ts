import { createStyles, Theme, WithStyles } from '@material-ui/core';
import { alertsColWidthStyles } from 'components/DataEntityDetails/DataEntityAlerts/DataEntityAlertsStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(1.25, 1),
      textDecoration: 'none',
      cursor: 'pointer',
      alignItems: 'center',
      '&:hover': {
        backgroundColor: theme.palette.backgrounds.primary,
      },
    },
    ...alertsColWidthStyles,
  });

export type StylesType = WithStyles<typeof styles>;
