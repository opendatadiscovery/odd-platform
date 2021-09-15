import { Theme, createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
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
      backgroundColor: theme.palette.text.secondary,
      color: theme.palette.common.white,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '& > *': {
        width: '6px',
        height: '6px',
      },
    },
    collapseBtnOpen: {
      backgroundColor: theme.palette.background.darken,
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
