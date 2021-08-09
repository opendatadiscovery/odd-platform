import { createStyles, Theme, WithStyles } from '@material-ui/core';

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
