import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      display: 'inline-flex',
      alignItems: 'center',
      border: '1px solid #EBECF0',
      borderRadius: '4px',
      padding: theme.spacing(0.25, 1),
      color: '#42526E',
    },
    important: {
      borderColor: '#FFBB33',
    },
    containerRemovable: {
      paddingRight: theme.spacing(0.5),
    },
    removeBtn: {
      marginLeft: theme.spacing(0.25),
    },
  });

export type StylesType = WithStyles<typeof styles>;
