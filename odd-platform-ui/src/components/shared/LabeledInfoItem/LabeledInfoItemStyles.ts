import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

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
      alignItems: 'center',
      '& $label': {
        marginRight: theme.spacing(2),
      },
    },
    label: {
      color: theme.palette.texts.secondary,
      lineHeight: theme.typography.h3.lineHeight,
      overflow: 'hidden',
    },
    value: {
      wordBreak: 'break-all',
      overflow: 'hidden',
    },
  });

export type StylesType = WithStyles<typeof styles>;
