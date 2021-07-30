import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      marginBottom: theme.spacing(2.75),
      '& > * + *': {
        marginTop: theme.spacing(1.25),
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
