import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    statsItem: {
      display: 'flex',
      alignItems: 'flex-start',
    },
    statIcon: {
      fontSize: theme.typography.h5.fontSize,
      marginRight: theme.spacing(1),
      color: theme.palette.button?.primaryLight.normal.color,
      alignSelf: 'center',
    },
    statCount: {},
    statLabel: {
      color: theme.palette.text.hint,
      marginLeft: theme.spacing(0.5),
    },
    typeLabel: {
      marginLeft: 0,
      marginBottom: theme.spacing(1.25),
    },
    refItem: {
      margin: theme.spacing(0.25, 0),
      '&:first-of-type': {
        marginTop: theme.spacing(1),
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
