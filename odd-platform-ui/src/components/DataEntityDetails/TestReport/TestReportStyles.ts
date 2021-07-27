import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    testReportContainer: {
      margin: theme.spacing(0.25, 0, 4, 0),
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'nowrap',
    },
    testReport: {
      '& > *': {
        marginRight: theme.spacing(5),
      },
    },
    testCount: {
      marginRight: theme.spacing(1),
      justifyContent: 'flex-end',
    },
    caption: { marginBottom: theme.spacing(3) },
    sectionContainer: {
      padding: 0,
      '& + $sectionContainer': { marginTop: theme.spacing(2) },
      '& > *': {
        padding: theme.spacing(2.5, 2),
      },
      '& > * + *': {
        borderTop: '1px solid',
        borderTopColor: '#EBECF0',
      },
    },
    sectionCaption: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(1.25),
    },
  });

export type StylesType = WithStyles<typeof styles>;
