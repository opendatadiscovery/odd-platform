import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    form: {
      '& > *': {
        marginTop: theme.spacing(1.5),
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
