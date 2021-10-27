import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: { marginTop: theme.spacing(6) },
    overviewGeneralSkeletonContainer: {},
    overviewMetadataSkeletonContainer: { marginTop: theme.spacing(6) },
    overviewAboutSkeletonContainer: { marginTop: theme.spacing(6) },
    largeItem: { height: '34px' },
    smallItem: { height: '26px' },
    skeletonLeftSide: { paddingRight: theme.spacing(6) },
    tabItem: { '& > *': { marginRight: theme.spacing(1) } },
  });

export type StylesType = WithStyles<typeof styles>;
