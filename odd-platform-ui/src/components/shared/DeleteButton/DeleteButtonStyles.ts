import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: { padding: '6px' },
    icon: { color: theme.palette.text.hint },
  });

export type StylesType = WithStyles<typeof styles>;
