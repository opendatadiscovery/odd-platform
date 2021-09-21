import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    path: {
      fill: 'none',
      stroke: theme.palette.texts.hint,
      strokeWidth: 1,
    },
    circle: {
      fill: theme.palette.texts.hint,
    },
  });

export type StylesType = WithStyles<typeof styles>;
