import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      paddingLeft: theme.spacing(1),
    },
    skeletonItem: {
      marginRight: theme.spacing(1),
    },
  });

export type StylesType = WithStyles<typeof styles>;
