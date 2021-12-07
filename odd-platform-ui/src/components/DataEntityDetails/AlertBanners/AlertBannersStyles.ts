import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(2),
      '& > * + *': {
        marginTop: theme.spacing(1.25),
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
