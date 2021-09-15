import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      width: '100%',
      height: 'inherit',
      backgroundColor: theme.palette.background.primary,
      fontSize: '0.6rem',
      position: 'relative',
    },
    actionsContainer: {
      position: 'absolute',
      top: 0,
      right: 0,
      padding: theme.spacing(1),
      display: 'inline-flex',
      alignItems: 'center',
      '& > * + *': {
        marginLeft: theme.spacing(1),
      },
    },
    loaderContainer: {
      width: '100%',
      height: 'inherit',
      backgroundColor: theme.palette.background.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export type StylesType = WithStyles<typeof styles>;
