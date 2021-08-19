import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: { width: '100%' },
  });

export type StylesType = WithStyles<typeof styles>;
