import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      alignItems: 'center',
      margin: theme.spacing(1, 0),
    },
    icon: {
      marginRight: theme.spacing(0.5),
    },
  });

export type StylesType = WithStyles<typeof styles>;
