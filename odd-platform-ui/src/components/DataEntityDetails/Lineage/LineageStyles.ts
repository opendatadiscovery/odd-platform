import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      width: '100%',
      display: 'flex',
      justifyContent: 'stretch',
      alignItems: 'stretch',
      justifySelf: 'stretch',
      flexGrow: 1,
    },
    title: {
      display: 'block',
    },
  });

export type StylesType = WithStyles<typeof styles>;
