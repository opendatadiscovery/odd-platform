import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      width: 'calc(100% - 8px)',
      padding: theme.spacing(2, 2, 2, 2),
      margin: '0 auto',
      alignItems: 'flex-start',
      '&:hover': {
        boxShadow: theme.shadows[8],
      },
      '&:hover $actionsContainer': {
        paddingBottom: '0 !important',
        display: 'flex',
        justifyContent: 'flex-end',
        '& > * + *': {
          marginLeft: theme.spacing(1),
        },
      },
    },
    actionsContainer: {
      display: 'none',
    },
    pullingValue: { color: 'green' },
    descriptionContainer: {
      '& > *': {
        marginBottom: theme.spacing(1),
      },
      '& > *:last-child': {
        marginBottom: theme.spacing(0),
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
