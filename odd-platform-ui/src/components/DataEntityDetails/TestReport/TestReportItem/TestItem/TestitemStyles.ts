import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      flexWrap: 'nowrap',
      padding: theme.spacing(0.75, 1),
      alignItems: 'center',
      borderRadius: '4px',
      '&:hover:not($active)': {
        backgroundColor: theme.palette.background.primary,
      },
    },
    active: {
      backgroundColor: theme.palette.background.secondary,
    },
    expectationItem: { marginRight: theme.spacing(0.5) },
  });

export type StylesType = WithStyles<typeof styles>;
