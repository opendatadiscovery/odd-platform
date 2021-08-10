import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      width: 'calc(100% - 8px)',
      padding: theme.spacing(2, 2, 2, 2),
      margin: theme.spacing(1, 0, 1, 0.5),
    },
    descriptionContainer: {
      '& > *': {
        marginBottom: theme.spacing(1),
      },
      '& > *:last-child': {
        marginBottom: theme.spacing(0),
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
