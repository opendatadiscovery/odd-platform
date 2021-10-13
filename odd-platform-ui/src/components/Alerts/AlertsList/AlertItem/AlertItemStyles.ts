import { createStyles, WithStyles, Theme } from '@material-ui/core';
import { alertsMainColWidthStyles } from 'components/Alerts/AlertsList/AlertsListStyles';

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
    alertName: { maxWidth: '118px' },
    ...alertsMainColWidthStyles,
  });

export type StylesType = WithStyles<typeof styles>;
