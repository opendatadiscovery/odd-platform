import {
  createStyles,
  Theme,
  WithStyles,
  darken,
} from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      backgroundColor: theme.palette.success.main,
      borderColor: theme.palette.success.main,
      color: '#ffffff',
      '&:hover': {
        backgroundColor: darken(theme.palette.success.main, 0.1),
        borderColor: darken(theme.palette.success.main, 0.1),
      },
    },
    disabled: {
      backgroundColor: theme.palette.divider,
      borderColor: theme.palette.divider,
      color: '#ffffff !important',
    },
  });

export type StylesType = WithStyles<typeof styles>;
