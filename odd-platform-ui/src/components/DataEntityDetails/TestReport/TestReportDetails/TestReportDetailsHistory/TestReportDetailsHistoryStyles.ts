import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: { width: '100%', marginTop: theme.spacing(2) },
    testRunsContainer: {
      marginTop: theme.spacing(1),
      alignItems: 'center',
    },
    testRunInfoItem: {
      justifyContent: 'center',
    },
  });

export type StylesType = WithStyles<typeof styles>;
