import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    checkboxContainer: {
      marginLeft: 0,
    },
    importantCheckbox: {
      width: '14px',
      height: '14px',
      marginRight: theme.spacing(1),
      padding: 0,
    },
    tagItemButtons: {
      margin: theme.spacing(1, 0, 1.5, 0),
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: theme.spacing(1.5),
      borderBottom: '1px solid',
      borderBottomColor: theme.palette.background.primary,
    },
  });

export type StylesType = WithStyles<typeof styles>;
