import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      justifyContent: 'space-between',
      flexWrap: 'nowrap',
      alignItems: 'center',
      padding: theme.spacing(1.5, 1, 1.5, 1),
      borderBottom: '1px solid',
      borderBottomColor: theme.palette.background.secondary,
      '&:hover': {
        backgroundColor: theme.palette.background.primary,
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
