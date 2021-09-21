import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    labelItemButtons: {
      margin: theme.spacing(1, 0, 1.5, 0),
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: theme.spacing(1.5),
      borderBottom: '1px solid',
      borderBottomColor: theme.palette.backgrounds.primary,
    },
  });

export type StylesType = WithStyles<typeof styles>;
