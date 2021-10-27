import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      justifyContent: 'space-between',
      flexWrap: 'nowrap',
      alignItems: 'center',
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
      visibility: 'hidden',
      '& > :first-child': {
        marginRight: theme.spacing(1),
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
