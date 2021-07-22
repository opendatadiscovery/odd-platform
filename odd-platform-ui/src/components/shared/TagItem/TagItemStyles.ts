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
      '&:hover': {
        borderColor: '#C1C7D0',
      },
      '&:active': {
        borderColor: '#A8B0BD',
      },
    },
    important: {
      borderColor: '#FFBB33',
      '&:hover, &:active': {
        borderColor: '#FFAA00',
      },
    },
    containerRemovable: {
      paddingRight: theme.spacing(0.5),
    },
    removeBtn: {
      marginLeft: theme.spacing(0.25),
    },
  });

export type StylesType = WithStyles<typeof styles>;
