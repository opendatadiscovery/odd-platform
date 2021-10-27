import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      flexWrap: 'nowrap',
      padding: theme.spacing(0.75, 1),
      alignItems: 'center',
      borderRadius: '4px',
      '&:hover:not($active)': {
        backgroundColor: theme.palette.backgrounds.primary,
      },
    },
    active: {
      backgroundColor: theme.palette.backgrounds.secondary,
    },
    expectationItem: { marginRight: theme.spacing(0.5) },
  });

export type StylesType = WithStyles<typeof styles>;
