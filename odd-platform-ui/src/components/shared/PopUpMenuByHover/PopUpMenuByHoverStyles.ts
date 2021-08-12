import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      width: 'auto',
      maxWidth: '100%',
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      '&:hover $childrenContainer': {
        display: 'block',
      },
    },
    childrenContainer: {
      display: 'none',
      position: 'absolute',
      zIndex: 10,
      maxWidth: '320px',
      wordBreak: 'break-all',
      padding: theme.spacing(1),
    },
    dark: {
      backgroundColor: '#253858',
      color: '#EBECF0',
      padding: theme.spacing(0.25, 0.5),
    },
  });

export type StylesType = WithStyles<typeof styles>;
