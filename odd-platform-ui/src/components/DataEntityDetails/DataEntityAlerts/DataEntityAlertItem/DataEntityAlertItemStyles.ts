import { createStyles, WithStyles } from '@material-ui/core';
import { alertsColWidthStyles } from 'components/DataEntityDetails/DataEntityAlerts/DataEntityAlertsStyles';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      padding: theme.spacing(1.25, 0),
      borderBottom: '1px solid',
      borderBottomColor: theme.palette.divider,
      '&:hover': {
        backgroundColor: theme.palette.background.primary,
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
