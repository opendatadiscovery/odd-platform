import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    tagItem: {
      margin: theme.spacing(0.5),
      '&:hover': { cursor: 'pointer' },
    },
  });

export type StylesType = WithStyles<typeof styles>;
