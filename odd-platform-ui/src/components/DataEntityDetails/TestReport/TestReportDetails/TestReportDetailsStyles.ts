import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(2),
      flexWrap: 'wrap',
    },
    tabsContainer: {
      marginTop: theme.spacing(2),
    },
  });

export type StylesType = WithStyles<typeof styles>;
