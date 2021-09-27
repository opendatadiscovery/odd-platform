import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    dataentityName: { height: '40px' },
    tabsSkeletonContainer: { marginTop: theme.spacing(3) },
    tabsSkeletonItem: { height: '34px' },
  });

export type StylesType = WithStyles<typeof styles>;
