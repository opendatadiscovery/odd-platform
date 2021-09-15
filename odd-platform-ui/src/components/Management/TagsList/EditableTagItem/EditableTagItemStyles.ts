import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      flexWrap: 'nowrap',
      padding: theme.spacing(1.5, 1, 1.5, 1),
      borderBottom: '1px solid',
      borderBottomColor: theme.palette.divider,
      '&:hover': {
        backgroundColor: theme.palette.background.primary,
      },
      '&:hover $actionsContainer': {
        visibility: 'visible',
      },
    },
    actionsContainer: {
      flexGrow: 1,
      visibility: 'hidden',
      justifyContent: 'flex-end',
      '& > :first-child': {
        marginRight: theme.spacing(1),
      },
    },
    col: {
      minWidth: '285px',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
    },
  });

export type StylesType = WithStyles<typeof styles>;
