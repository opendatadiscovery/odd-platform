import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      width: '100%',
      height: 'inherit',
      backgroundColor: theme.palette.backgrounds.primary,
      fontSize: '0.6rem',
      position: 'relative',
    },
    layer: {
      width: '100%',
      height: '100vh',
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
      backgroundColor: theme.palette.backgrounds.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export type StylesType = WithStyles<typeof styles>;
