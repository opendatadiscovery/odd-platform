import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    checkboxContainer: {
      marginLeft: 0,
    },
    pullingCheckbox: {
      width: '14px',
      height: '14px',
      marginRight: theme.spacing(1),
      padding: 0,
    },
    tagItemButtons: {
      marginTop: theme.spacing(1),
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  });

export type StylesType = WithStyles<typeof styles>;
