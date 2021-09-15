import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {},
    caption: { marginBottom: theme.spacing(3) },
    sectionContainer: {
      padding: 0,
      '& + $sectionContainer': { marginTop: theme.spacing(2) },
      '& > *': {
        padding: theme.spacing(2.5, 2),
      },
      '& > * + *': {
        borderTop: '1px solid',
        borderTopColor: theme.palette.divider,
      },
    },
    sectionCaption: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(1.25),
    },
  });

export type StylesType = WithStyles<typeof styles>;
