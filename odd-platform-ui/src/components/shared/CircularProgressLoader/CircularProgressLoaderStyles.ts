import { createStyles, Theme, WithStyles, fade } from '@material-ui/core';

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
    spinnerContainer: { alignItems: 'center' },
    textContainer: { justifyContent: 'center' },
  });

export type StylesType = WithStyles<typeof styles>;
