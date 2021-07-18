import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    labelItemButtons: {
      margin: theme.spacing(1, 0, 1.5, 0),
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: theme.spacing(1.5),
      borderBottom: '1px solid #F4F5F7',
    },
  });

export type StylesType = WithStyles<typeof styles>;
