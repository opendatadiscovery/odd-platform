import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    labelItemButtons: {
      margin: theme.spacing(1, 0, 1.5, 0),
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: theme.spacing(1.5),
      borderBottom: '1px solid',
      borderBottomColor: theme.palette.background.primary,
    },
  });

export type StylesType = WithStyles<typeof styles>;
