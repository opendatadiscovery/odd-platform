import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      margin: 0,
      padding: theme.spacing(0.25, 0, 0, 0),
      borderTop: '1px solid',
      borderTopColor: '#EBECF0',
    },
    typesList: {
      display: 'flex',
      flexWrap: 'nowrap',
      marginLeft: theme.spacing(1.25),
      '& > * + *': {
        marginLeft: theme.spacing(0.5),
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
