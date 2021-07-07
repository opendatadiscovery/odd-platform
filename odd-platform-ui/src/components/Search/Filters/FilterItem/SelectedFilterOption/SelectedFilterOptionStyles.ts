import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    content: {
      display: 'flex',
      cursor: 'pointer',
      fontSize: theme.typography.body1.fontSize,
      maxWidth: '100%',
      color: '#42526E',
      backgroundColor: '#F4F5F7',
      borderRadius: '2px',
      padding: theme.spacing(0, 0.75, 0, 0.5),
      alignItems: 'center',
      justifyContent: 'space-between',
      '&:hover': {
        backgroundColor: '#EBECF0',
      },
    },
    removeBtn: {
      fontSize: theme.typography.body1.fontSize,
      color: '#B3BAC5',
      marginLeft: theme.spacing(1),
      width: '8px',
      height: '8px',
      padding: 0,
    },
  });

export type StylesType = WithStyles<typeof styles>;
