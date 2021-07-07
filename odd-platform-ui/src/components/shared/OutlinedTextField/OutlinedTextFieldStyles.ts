import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: { marginTop: theme.spacing(1.5) },
  });

export type StylesType = WithStyles<typeof styles>;
