import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    path: {
      fill: 'none',
      stroke: theme.palette.text.secondary,
      strokeWidth: 1,
    },
    circle: {
      fill: theme.palette.text.secondary,
    },
  });

export type StylesType = WithStyles<typeof styles>;
