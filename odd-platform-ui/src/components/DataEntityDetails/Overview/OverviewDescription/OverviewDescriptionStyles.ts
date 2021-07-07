import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    captionContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(0.5),
    },
    caption: {},
    preview: {
      fontSize: theme.typography.body1.fontSize,
      fontFamily: 'inherit',
      fontWeight: theme.typography.body1.fontWeight,
      lineHeight: theme.typography.body1.lineHeight,
      color: '#7A869A',
    },
    formActions: {
      marginTop: theme.spacing(2),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      '& > * + *': {
        marginLeft: theme.spacing(0.5),
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
