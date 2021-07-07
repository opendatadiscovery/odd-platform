import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    infoContainer: { marginTop: theme.spacing(3) },
  });

export type StylesType = WithStyles<typeof styles>;
