import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      marginBottom: theme.spacing(2),
      alignItems: 'center',
    },
    metadataTypeContainer: {
      marginTop: theme.spacing(1.5),
    },
    metadataValueContainer: {
      marginTop: theme.spacing(1.5),
    },
    typeContainer: {
      marginTop: theme.spacing(1.5),
    },
    typeTitle: {
      marginRight: theme.spacing(0.5),
      fontSize: '12px',
      color: theme.palette.text.secondary,
      fontWeight: theme.typography.subtitle2.fontWeight,
    },
    hidden: {
      display: 'none',
    },
  });

export type StylesType = WithStyles<typeof styles>;
