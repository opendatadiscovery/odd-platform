import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    subtitle: {},
    subtitleContainer: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(1),
    },
    collapseContainer: { marginTop: theme.spacing(0.5) },
    viewAllBtn: {
      marginTop: theme.spacing(0.75),
    },
  });

export type StylesType = WithStyles<typeof styles>;
