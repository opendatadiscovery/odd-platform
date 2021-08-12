import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    dataentityName: { height: '40px' },
    tabsSkeletonContainer: { marginTop: theme.spacing(3) },
    tabsSkeletonItem: { height: '34px' },
  });

export type StylesType = WithStyles<typeof styles>;
