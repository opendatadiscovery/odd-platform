import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      width: '100%',
      marginTop: theme.spacing(2),
    },
    testRunItemContainer: {
      marginBottom: theme.spacing(1),
      alignItems: 'center',
      '& + $testRunItemContainer': {
        paddingTop: theme.spacing(1),
        borderTop: '1px solid',
        borderTopColor: '#EBECF0',
      },
    },
    testRunInfoItem: {
      '& + $testRunInfoItem': {
        marginTop: theme.spacing(1),
      },
    },
    statusReason: {
      color: '#A8B0BD',
      marginLeft: theme.spacing(1),
    },
  });

export type StylesType = WithStyles<typeof styles>;
