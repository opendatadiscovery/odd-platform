import { createStyles, Theme, WithStyles } from '@material-ui/core';
import { alertsColWidthStyles } from 'components/DataEntityDetails/DataEntityAlerts/DataEntityAlertsStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(1.25, 0),
      borderBottom: '1px solid',
      borderBottomColor: theme.palette.divider,
      '&:hover': {
        backgroundColor: theme.palette.backgrounds.primary,
        '& $optionsBtn': {
          opacity: 1,
        },
      },
    },
    optionsBtn: {
      opacity: 0,
    },
    ...alertsColWidthStyles,
  });

export type StylesType = WithStyles<typeof styles>;
