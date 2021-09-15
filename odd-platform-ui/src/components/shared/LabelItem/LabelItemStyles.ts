import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      display: 'inline-flex',
      alignItems: 'center',
      backgroundColor: theme.palette.background.secondary,
      borderRadius: '2px',
      padding: theme.spacing(0, 0.25),
      color: theme.palette.text.info,
      position: 'relative',
      margin: theme.spacing(0.25),
    },
    containerRemovable: {
      paddingRight: theme.spacing(0.5),
    },
    unfilled: {
      backgroundColor: theme.palette.background.default,
      border: '1px solid',
      borderColor: theme.palette.divider,
      borderRadius: '4px',
      padding: theme.spacing(0.25, 0.5, 0.25, 1),
      color: theme.palette.text.info,
    },
    removeBtn: {
      marginLeft: theme.spacing(0.25),
    },
  });

export type StylesType = WithStyles<typeof styles>;
