import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
  });

export type StylesType = WithStyles<typeof styles>;
