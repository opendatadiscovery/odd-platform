import { Theme, alpha } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: '3px',
      margin: '0 auto',
      position: 'absolute',
      top: '0',
      zIndex: 9999,
    },
    colorPrimary: {
      backgroundColor: alpha('#0080FF', 0.9),
    },
    barColorPrimary: {
      backgroundColor: theme.palette.text.secondary,
    },
  });

export type StylesType = WithStyles<typeof styles>;
