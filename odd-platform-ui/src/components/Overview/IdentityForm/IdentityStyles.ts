import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(4),
    },
    captionIcon: {
      width: '76px',
      height: '41px',
    },
    caption: {
      marginTop: theme.spacing(2),
    },
    formContainer: {
      width: '100%',
      maxWidth: '320px',
      marginTop: theme.spacing(1.75),
    },
    submitBtn: {
      marginTop: theme.spacing(2),
    },
  });

export type StylesType = WithStyles<typeof styles>;
