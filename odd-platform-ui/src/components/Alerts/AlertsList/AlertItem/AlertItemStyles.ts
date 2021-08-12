import { Theme, createStyles, WithStyles } from '@material-ui/core';
import { alertsMainColWidthStyles } from 'components/Alerts/AlertsList/AlertsListStyles';

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
    typesList: {
      display: 'flex',
      flexWrap: 'nowrap',
      marginLeft: theme.spacing(1.25),
      '& > * + *': {
        marginLeft: theme.spacing(0.5),
      },
    },
    optionsBtn: {
      opacity: 0,
    },
    ...alertsMainColWidthStyles,
  });

export type StylesType = WithStyles<typeof styles>;
