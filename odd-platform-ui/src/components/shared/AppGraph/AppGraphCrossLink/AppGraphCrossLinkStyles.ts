import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    path: {
      fill: 'none',
      stroke: '#99CCFF',
      strokeWidth: 1,
    },
    arrow: {
      fill: '#99CCFF',
    },
  });

export type StylesType = WithStyles<typeof styles>;
