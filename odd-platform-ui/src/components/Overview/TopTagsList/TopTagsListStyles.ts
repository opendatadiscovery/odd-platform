import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    tagItem: {
      margin: theme.spacing(0.5),
      '&:hover': { cursor: 'pointer' },
    },
  });

export type StylesType = WithStyles<typeof styles>;
