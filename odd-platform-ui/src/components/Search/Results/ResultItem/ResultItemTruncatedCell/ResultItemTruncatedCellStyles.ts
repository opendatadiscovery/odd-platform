import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    truncatedList: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      margin: theme.spacing(-0.25, -0.25),
      '& > *': {
        margin: theme.spacing(0.25, 0.25),
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
