import { Theme, createStyles, WithStyles } from '@material-ui/core';
import { maxContentWidthWithoutSidebar } from 'lib/constants';

const maxTagsContainerWidth = 920;

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
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(9),
    },
    tagsContainer: {
      maxWidth: `${maxTagsContainerWidth}px`,
      justifyContent: 'center',
      margin: '0 auto',
    },
    infoBarContainer: {
      display: 'none', // Remove when alerts implemented
      justifyContent: 'space-between',
      marginTop: theme.spacing(8),
      '& > *:last-child': {
        marginRight: 0,
      },
    },
    infoBarItem: {
      height: '56px',
      marginRight: theme.spacing(3),
      padding: theme.spacing(1, 2),
      backgroundColor: '#F4F5F7',
      borderRadius: '4px',
    },
    dataContainer: {
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
      marginTop: theme.spacing(2.5),
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    alertsContainer: {
      '&:hover $showAllAlerts': {
        display: 'block',
      },
    },
    alerts: {
      flexWrap: 'nowrap',
    },
    myAlerts: {
      flexWrap: 'nowrap',
      width: '33%',
      alignItems: 'center',
    },
    dependAlerts: {
      flexWrap: 'nowrap',
      width: '33%',
      alignItems: 'center',
    },
    alertsCount: {
      margin: theme.spacing(0, 0.5),
    },
    alertIcon: {
      marginBottom: '-2px',
    },
    infoBarStatsText: {
      color: '#B3BAC5',
      lineHeight: theme.typography.h2.lineHeight,
      marginBottom: '-4px',
    },
    showAllAlerts: {
      display: 'none',
      fontSize: theme.typography.subtitle2.fontSize,
      lineHeight: theme.typography.subtitle2.lineHeight,
    },
    slaTargetValue: {
      margin: theme.spacing(0, 0.5),
    },
  });

export type StylesType = WithStyles<typeof styles>;
