import { createStyles, Theme, WithStyles } from '@material-ui/core';
import {
  maxContentWidthWithoutSidebar,
  toolbarHeight,
} from 'lib/constants';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      margin: '0 auto',
      padding: theme.spacing(2),
      width: `${maxContentWidthWithoutSidebar}px`,
      display: 'flex',
      flexDirection: 'column',
      minHeight: `calc(100vh - ${toolbarHeight}px - 4px)`,
      [theme.breakpoints.up(maxContentWidthWithoutSidebar)]: {
        width: '100%',
        maxWidth: `${maxContentWidthWithoutSidebar}px`,
      },
    },
    caption: {
      flexGrow: 1,
      marginBottom: theme.spacing(2),
      '&:hover $internalNameEditBtnContainer': {
        display: 'block',
      },
    },
    updatedAt: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      '& p': { marginLeft: theme.spacing(0.5) },
    },
    updatedAtIcon: { fontSize: theme.typography.h1.fontSize },
    entityTypeLabel: {
      marginLeft: theme.spacing(1),
    },
    internalNameEditBtnContainer: {
      display: 'none',
    },
    internalNameEditBtn: {
      marginLeft: '8px',
    },
    originalLabel: {
      marginRight: '4px',
      padding: '0 2px',
      backgroundColor: theme.palette.backgrounds.secondary,
      borderRadius: '2px',
      color: theme.palette.texts.info,
    },
    tabsContainer: {
      marginBottom: theme.spacing(2),
    },
  });

export type StylesType = WithStyles<typeof styles>;
