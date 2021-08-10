import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(0, 1),
    },
    structureSkeleton: {
      padding: theme.spacing(5, 0, 0, 5),
    },
    largeItem: { height: '34px' },
    mediumItem: { height: '26px' },
    smallItem: { height: '20px' },
  });

export type StylesType = WithStyles<typeof styles>;
