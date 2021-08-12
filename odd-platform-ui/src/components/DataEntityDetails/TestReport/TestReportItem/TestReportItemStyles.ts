import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      justifyContent: 'space-between',
      flexWrap: 'nowrap',
      flexDirection: 'column',
    },
    testReportHeader: {
      cursor: 'pointer',
      paddingBottom: theme.spacing(0.75),
    },
    divider: {
      cursor: 'pointer',
      padding: 0,
      marginRight: theme.spacing(1),
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
    },
    collapseBtn: {
      height: '14px',
      width: '14px',
      borderRadius: '2px',
      backgroundColor: '#C4C4C4',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '& > *': {
        width: '6px',
        height: '6px',
      },
    },
    collapseBtnOpen: {
      backgroundColor: '#091E42',
    },
    testReportBySuitNameContainer: {
      flexWrap: 'nowrap',
      justifyContent: 'flex-end',
    },
    testStatusItem: {
      marginLeft: theme.spacing(0.5),
    },
  });

export type StylesType = WithStyles<typeof styles>;
