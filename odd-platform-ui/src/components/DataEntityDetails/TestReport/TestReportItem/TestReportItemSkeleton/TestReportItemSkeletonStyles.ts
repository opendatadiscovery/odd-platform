import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(1.25, 1),
      textDecoration: 'none',
      cursor: 'pointer',
      alignItems: 'center',
      '&:hover': {
        backgroundColor: '#F4F5F7',
      },
    },
    item: { marginBottom: theme.spacing(2) },
  });

export type StylesType = WithStyles<typeof styles>;
