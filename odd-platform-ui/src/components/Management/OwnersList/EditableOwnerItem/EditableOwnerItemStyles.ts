import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      justifyContent: 'space-between',
      flexWrap: 'nowrap',
      alignItems: 'center',
      padding: theme.spacing(1.5, 1, 1.5, 1),
      borderBottom: '1px solid #EBECF0',
      '&:hover': {
        backgroundColor: '#F4F5F7',
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
