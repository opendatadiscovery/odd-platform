import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    statsItem: {
      display: 'flex',
      alignItems: 'flex-start',
    },
    statCount: {},
    statLabel: {
      color: '#B3BAC5',
      marginLeft: theme.spacing(0.5),
      lineHeight: theme.typography.h2.lineHeight,
    },
    statValue: {
      fontWeight: theme.typography.fontWeightBold,
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
