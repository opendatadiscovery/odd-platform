import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    form: {},
  });

export type StylesType = WithStyles<typeof styles>;
