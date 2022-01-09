import { Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import {
  maxContentWidthWithoutSidebar,
  maxTagsContainerWidth,
} from 'lib/constants';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      margin: '0 auto',
      padding: theme.spacing(2),
      width: `${maxContentWidthWithoutSidebar}px`,
      [theme.breakpoints.up(maxContentWidthWithoutSidebar)]: {
        width: '100%',
        maxWidth: `${maxContentWidthWithoutSidebar}px`,
        justifyContent: 'center',
      },
    },
    searchContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(6),
      justifyContent: 'center',
    },
    searchSkeleton: { maxWidth: '644px' },
    tagsContainer: {
      maxWidth: `${maxTagsContainerWidth}px`,
      justifyContent: 'center',
      margin: '0 auto',
      '& > span': { marginRight: theme.spacing(1) },
    },
    infoBarContainer: {
      justifyContent: 'space-between',
      marginTop: theme.spacing(6),
      '& > *:last-child': {
        marginRight: 0,
      },
    },
    infoBarItem: {
      marginRight: theme.spacing(3),
      borderRadius: '4px',
    },
    dataContainer: {
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
      marginTop: theme.spacing(2.5),
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    dataSkeleton: { marginBottom: theme.spacing(2) },
  });

export type StylesType = WithStyles<typeof styles>;
