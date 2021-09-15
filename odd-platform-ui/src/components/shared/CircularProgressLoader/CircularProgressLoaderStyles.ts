import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      padding: theme.spacing(0.75, 1),
      backgroundColor: theme.palette.entityType?.CONSUMER,
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
    circularProgress: {
      color: theme.palette.button?.primaryLight.normal.color,
    },
  });

export type StylesType = WithStyles<typeof styles>;
