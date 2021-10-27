import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    skeleton: { height: '28px' },
    skeletonStatItem: { height: '17px' },
    generalStats: { marginTop: theme.spacing(3) },
    statItem: { marginTop: theme.spacing(1) },
  });

export type StylesType = WithStyles<typeof styles>;
