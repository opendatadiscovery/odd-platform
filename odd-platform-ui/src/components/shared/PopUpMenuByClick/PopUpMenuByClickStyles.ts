import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      position: 'relative',
    },
    menu: {
      display: 'none',
      padding: theme.spacing(1, 0),
      position: 'absolute',
      zIndex: 2,
      top: '25px',
      right: '5px',
    },
    menuOpened: {
      display: 'block',
    },
  });

export type StylesType = WithStyles<typeof styles>;
