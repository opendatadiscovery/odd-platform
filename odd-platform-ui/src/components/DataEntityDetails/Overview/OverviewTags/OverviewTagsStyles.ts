import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    captionContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(2.25),
    },
    caption: {},
    tagsContainer: { margin: theme.spacing(0, -0.5, 0, -0.5) },
    tagItem: { margin: theme.spacing(0.5) },
    viewAllBtn: {
      display: 'flex',
      marginTop: theme.spacing(1.25),
      marginLeft: theme.spacing(0.5),
    },
  });

export type StylesType = WithStyles<typeof styles>;
