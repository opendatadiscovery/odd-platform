import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    skeleton: { height: '28px' },
    skeletonStatItem: { height: '17px' },
    generalStats: { marginTop: theme.spacing(3) },
    statItem: { marginTop: theme.spacing(1) },
  });

export type StylesType = WithStyles<typeof styles>;
