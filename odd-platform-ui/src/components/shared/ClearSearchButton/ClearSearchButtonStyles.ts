import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    icon: {
      width: '16px',
      height: '16px',
      color: theme.palette.text.hint,
    },
  });

export type StylesType = WithStyles<typeof styles>;
