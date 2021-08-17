import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      alignSelf: 'flex-start',
      marginTop: theme.spacing(2),
    },
    icon: {
      marginRight: theme.spacing(0.5),
    },
  });

export type StylesType = WithStyles<typeof styles>;
