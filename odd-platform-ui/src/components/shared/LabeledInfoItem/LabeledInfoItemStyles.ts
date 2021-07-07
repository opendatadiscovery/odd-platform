import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
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
      color: '#7A869A',
    },
    value: {
      wordBreak: 'break-all',
    },
  });

export type StylesType = WithStyles<typeof styles>;
