import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: { width: '100%' },
    statContainer: { margin: theme.spacing(2, 0) },
    statItem: { marginBottom: theme.spacing(1) },
    paramContainer: { marginBottom: theme.spacing(1) },
    paramName: { paddingRight: theme.spacing(0.5) },
  });

export type StylesType = WithStyles<typeof styles>;
