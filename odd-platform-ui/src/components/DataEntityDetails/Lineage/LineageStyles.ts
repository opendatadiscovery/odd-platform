import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      width: '100%',
      display: 'flex',
      justifyContent: 'stretch',
      alignItems: 'stretch',
      justifySelf: 'stretch',
      flexGrow: 1,
    },
    title: {
      display: 'block',
    },
  });

export type StylesType = WithStyles<typeof styles>;
