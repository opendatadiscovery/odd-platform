import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      alignSelf: 'flex-start',
      marginTop: theme.spacing(2),
    },
    icon: {
      marginRight: theme.spacing(0.5),
    },
  });

export type StylesType = WithStyles<typeof styles>;
