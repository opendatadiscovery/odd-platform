import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
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
      borderBottom: '1px solid #F4F5F7',
    },
  });

export type StylesType = WithStyles<typeof styles>;
