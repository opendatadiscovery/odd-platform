import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      paddingLeft: theme.spacing(1),
    },
    skeletonItem: {
      marginRight: theme.spacing(1),
    },
  });

export type StylesType = WithStyles<typeof styles>;
