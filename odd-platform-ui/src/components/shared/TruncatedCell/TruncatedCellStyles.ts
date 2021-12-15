import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    truncatedList: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      margin: theme.spacing(-0.25, -0.25),
      '& > *': {
        margin: theme.spacing(0.25, 0.25),
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
