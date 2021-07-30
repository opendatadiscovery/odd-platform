import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: { width: '100%' },
    statContainer: { margin: theme.spacing(2, 0) },
    statItem: { marginBottom: theme.spacing(1) },
    paramContainer: { marginBottom: theme.spacing(1) },
  });

export type StylesType = WithStyles<typeof styles>;
