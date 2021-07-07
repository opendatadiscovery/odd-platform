import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      width: '100%',
      height: 'inherit',
      backgroundColor: '#F4F5F7',
      fontSize: '0.6rem',
      position: 'relative',
    },
    actionsContainer: {
      position: 'absolute',
      top: 0,
      right: 0,
      padding: theme.spacing(1),
      display: 'inline-flex',
      alignItems: 'center',
      '& > * + *': {
        marginLeft: theme.spacing(1),
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
