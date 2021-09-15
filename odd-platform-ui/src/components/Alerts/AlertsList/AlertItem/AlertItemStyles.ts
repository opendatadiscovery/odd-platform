import { createStyles, WithStyles } from '@material-ui/core';
import { alertsMainColWidthStyles } from 'components/Alerts/AlertsList/AlertsListStyles';
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
