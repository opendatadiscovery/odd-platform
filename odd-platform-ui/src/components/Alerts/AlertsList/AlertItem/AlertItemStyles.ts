import { Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
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
    },
    dataEntityLink: { overflow: 'hidden' },
    optionsBtn: {
      opacity: 0,
    },
    alertName: { maxWidth: '118px' },
    ...alertsMainColWidthStyles,
  });

export type StylesType = WithStyles<typeof styles>;
