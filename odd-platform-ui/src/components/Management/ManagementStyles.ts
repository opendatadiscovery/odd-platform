import { Theme, createStyles, WithStyles } from '@material-ui/core';
import {
  maxContentWidth,
  maxSidebarWidth,
  toolbarHeight,
} from 'lib/constants';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(2),
      display: 'flex',
      justifyContent: 'center',
    },
    contentContainer: {
      position: 'relative',
      paddingLeft: `${maxSidebarWidth}px`,
      [theme.breakpoints.up(maxContentWidth + maxSidebarWidth)]: {
        paddingLeft: `${maxSidebarWidth}px`,
        paddingRight: 0,
        justifyContent: 'center',
      },
    },
    sidebarContainer: {
      width: '100%',
      maxWidth: `${maxSidebarWidth}px`,
      position: 'fixed',
      top: `${toolbarHeight}px`,
      left: theme.spacing(2),
      marginTop: theme.spacing(2),
    },
    content: {
      flexGrow: 1,
      maxWidth: `${maxContentWidth}px`,
      [theme.breakpoints.up(maxContentWidth + maxSidebarWidth)]: {
        justifyContent: 'center',
        width: `${maxContentWidth}px`,
      },
    },
    sidebar: {
      padding: theme.spacing(0.5),
    },
    tabsContainer: {},
  });

export type StylesType = WithStyles<typeof styles>;
