import { Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
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
      '& p': { marginLeft: theme.spacing(1) },
    },
    entityTypeLabel: {
      marginRight: theme.spacing(1),
    },
    internalNameEditBtnContainer: {
      display: 'none',
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
