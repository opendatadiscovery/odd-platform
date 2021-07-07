import { createStyles, Theme, WithStyles, fade } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: '3px',
      margin: '0 auto',
      position: 'absolute',
      top: '0',
      zIndex: 9999,
    },
    colorPrimary: {
      backgroundColor: fade(theme.palette.secondary.main, 0.9),
    },
    barColorPrimary: {
      backgroundColor: theme.palette.text.secondary,
    },
  });

export type StylesType = WithStyles<typeof styles>;
