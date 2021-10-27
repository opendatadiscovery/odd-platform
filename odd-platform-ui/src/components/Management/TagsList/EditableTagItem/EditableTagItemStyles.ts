import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      flexWrap: 'nowrap',
      padding: theme.spacing(1.5, 1, 1.5, 1),
      borderBottom: '1px solid',
      borderBottomColor: theme.palette.divider,
      '&:hover': {
        backgroundColor: theme.palette.backgrounds.primary,
      },
      '&:hover $actionsContainer': {
        visibility: 'visible',
      },
    },
    actionsContainer: {
      flexGrow: 1,
      visibility: 'hidden',
      justifyContent: 'flex-end',
    },
    col: {
      minWidth: '285px',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
    },
  });

export type StylesType = WithStyles<typeof styles>;
