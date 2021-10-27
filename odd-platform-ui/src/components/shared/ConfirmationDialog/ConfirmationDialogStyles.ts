import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: { padding: '6px' },
    content: {},
    actions: {
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-start',
    },
  });

export type StylesType = WithStyles<typeof styles>;
