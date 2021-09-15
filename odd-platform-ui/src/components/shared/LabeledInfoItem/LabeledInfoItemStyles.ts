import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
    inline: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      alignItems: 'flex-start',
      '& $label': {
        marginRight: theme.spacing(2),
      },
    },
    label: {
      color: theme.palette.text.secondary,
    },
    value: {
      wordBreak: 'break-all',
    },
  });

export type StylesType = WithStyles<typeof styles>;
