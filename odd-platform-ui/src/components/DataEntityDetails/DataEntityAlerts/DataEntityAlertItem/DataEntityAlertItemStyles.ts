import { Theme, createStyles, WithStyles } from '@material-ui/core';
import { alertsColWidthStyles } from 'components/DataEntityDetails/DataEntityAlerts/DataEntityAlertsStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(1.25, 0),
      borderBottom: '1px solid #EBECF0',
      '&:hover': {
        backgroundColor: '#F4F5F7',
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
