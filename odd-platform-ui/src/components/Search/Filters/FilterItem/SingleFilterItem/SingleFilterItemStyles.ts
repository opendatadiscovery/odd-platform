import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {},
    caption: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(0.5),
      color: theme.palette.text.secondary,
    },
    singleSelect: {
      width: '192px',
    },
  });

export type StylesType = WithStyles<typeof styles>;
