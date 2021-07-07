import { createStyles, Theme, WithStyles } from '@material-ui/core';
import {
  maxContentWidth,
  maxSidebarWidth,
  toolbarHeight,
} from 'lib/constants';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      minHeight: `${toolbarHeight}px`,
      height: `${toolbarHeight}px`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderBottom: '1px solid #EBECF0',
    },
    contentContainer: {
      position: 'relative',
      paddingLeft: `${maxSidebarWidth}px`,
      paddingRight: theme.spacing(2),
      [theme.breakpoints.up(maxContentWidth + maxSidebarWidth)]: {
        justifyContent: 'center',
      },
    },
    logoContainer: {
      padding: theme.spacing(2),
      width: '100%',
      maxWidth: `${maxSidebarWidth}px`,
      position: 'fixed',
      top: 0,
      left: 0,
    },
    actionsContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexGrow: 1,
      maxWidth: '100%',
      justifySelf: 'stretch',
      [theme.breakpoints.up(maxContentWidth + maxSidebarWidth)]: {
        width: `${maxContentWidth}px`,
      },
    },
    title: {
      display: 'none',
      color: '#000000',
      textDecoration: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        alignItems: 'center',
      },
    },
    lightBg: {
      backgroundColor: '#ffffff',
    },
    darkBg: {
      backgroundColor: theme.palette.background.default,
    },
    sectionDesktop: {
      justifyContent: 'flex-end',
      alignItems: 'center',
      color: theme.palette.text.hint,
      [theme.breakpoints.up('md')]: { display: 'flex' },
    },
    userAvatar: {
      width: '22px',
      height: '22px',
      borderRadius: '50%',
    },
    userName: {
      fontSize: '15px',
      color: theme.palette.text.primary,
      marginLeft: '8px',
      marginRight: '8px',
    },
    tabsContainer: {
      paddingLeft: theme.spacing(1),
    },
  });

export type StylesType = WithStyles<typeof styles>;
