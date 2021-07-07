import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      display: 'inline-flex',
      alignItems: 'center',
      backgroundColor: '#EBECF0',
      borderRadius: '2px',
      padding: theme.spacing(0, 0.25),
      color: '#42526E',
      position: 'relative',
      margin: theme.spacing(0.25),
    },
    containerRemovable: {
      paddingRight: theme.spacing(0.5),
    },
    unfilled: {
      backgroundColor: '#ffffff',
      border: '1px solid #EBECF0',
      borderRadius: '4px',
      padding: theme.spacing(0.25, 0.5, 0.25, 1),
      color: '#42526E',
    },
    removeBtn: {
      marginLeft: theme.spacing(0.25),
    },
  });

export type StylesType = WithStyles<typeof styles>;
