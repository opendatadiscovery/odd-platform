import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'nowrap',
      backgroundColor: theme.palette.runStatus?.failed,
      borderRadius: '2px',
      padding: theme.spacing(0.5, 1),
      boxShadow: theme.shadows[1],
    },
    description: {
      display: 'flex',
      alignItems: 'center',
    },
    icon: {
      marginRight: theme.spacing(1),
    },
    actions: {},
  });

export type StylesType = WithStyles<typeof styles>;
