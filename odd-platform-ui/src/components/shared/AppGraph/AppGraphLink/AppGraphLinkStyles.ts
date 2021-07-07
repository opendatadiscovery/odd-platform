import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    path: {
      fill: 'none',
      stroke: '#7A869A',
      strokeWidth: 1,
    },
    circle: {
      fill: '#7A869A',
    },
  });

export type StylesType = WithStyles<typeof styles>;
