import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(0.75, 1),
      backgroundColor: '#E5F2FF',
      borderRadius: theme.spacing(2),
      justifyContent: 'space-between',
      flexWrap: 'nowrap',
      alignItems: 'center',
    },
    spinnerContainer: {
      alignItems: 'center',
      borderRadius: '50%',
      boxShadow: '0px 0px 0px 1.2px white inset',
    },
    textContainer: {
      justifyContent: 'center',
      marginLeft: theme.spacing(1.25),
      whiteSpace: 'nowrap',
    },
    circularProgress: { color: '#0066CC' },
  });

export type StylesType = WithStyles<typeof styles>;
