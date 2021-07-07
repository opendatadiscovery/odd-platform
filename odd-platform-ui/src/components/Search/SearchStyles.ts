import { Theme, createStyles, WithStyles } from '@material-ui/core';
import {
  maxContentWidth,
  maxSidebarWidth,
  toolbarHeight,
} from 'lib/constants';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      paddingTop: theme.spacing(2),
      height: `calc(100vh - 5px - ${toolbarHeight}px)`,
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
    },
    contentContainer: {
      position: 'relative',
      paddingLeft: `${maxSidebarWidth}px`,
      paddingRight: theme.spacing(2),
      [theme.breakpoints.up(maxContentWidth + maxSidebarWidth)]: {
        justifyContent: 'center',
      },
    },
    filtersContainer: {
      width: '100%',
      maxWidth: `${maxSidebarWidth}px`,
      position: 'fixed',
      top: `${toolbarHeight}px`,
      left: 0,
    },
    resultsContainer: {
      paddingLeft: `16px !important`,
      flexGrow: 1,
      maxWidth: '100%',
      justifySelf: 'stretch',
      [theme.breakpoints.up(maxContentWidth + maxSidebarWidth)]: {
        width: `${maxContentWidth}px`,
      },
    },
    searchInput: {
      justifyContent: 'flex-start',
      marginLeft: '-4px',
    },
  });

export type StylesType = WithStyles<typeof styles>;
