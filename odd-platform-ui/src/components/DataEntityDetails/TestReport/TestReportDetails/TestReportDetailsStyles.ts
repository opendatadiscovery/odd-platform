import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(2),
      flexWrap: 'wrap',
    },
    tabsContainer: {
      marginTop: theme.spacing(2),
    },
  });

export type StylesType = WithStyles<typeof styles>;
