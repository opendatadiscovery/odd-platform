import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

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
