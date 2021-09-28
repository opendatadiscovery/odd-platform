import { createStyles, WithStyles, Theme } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    caption: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(0.5),
      color: theme.palette.text.secondary,
    },
    singleSelect: {
      width: '192px',
    },
  });

export type StylesType = WithStyles<typeof styles>;
