import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: { padding: '6px' },
    content: {},
    actions: {
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-start',
    },
  });

export type StylesType = WithStyles<typeof styles>;
