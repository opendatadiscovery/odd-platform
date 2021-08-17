import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      flexWrap: 'nowrap',
      padding: theme.spacing(0.75, 1),
      alignItems: 'center',
      borderRadius: '4px',
      '&:hover:not($active)': {
        backgroundColor: '#F4F5F7',
      },
    },
    active: {
      backgroundColor: '#EBECF0',
    },
    expectationItem: { marginRight: theme.spacing(0.5) },
  });

export type StylesType = WithStyles<typeof styles>;
