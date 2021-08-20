import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(1.5, 1, 1.5, 1),
    },
    col: {
      minWidth: '285px',
      display: 'flex',
      alignItems: 'center',
    },
  });

export type StylesType = WithStyles<typeof styles>;
