import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      '& > :first-child': {
        marginBottom: theme.spacing(1),
      },
    },
    caption: {
      marginBottom: theme.spacing(2),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: 'calc(100% - 8px)',
    },
    spinnerContainer: {
      display: 'flex',
      justifyContent: 'center',
      padding: theme.spacing(1),
    },
    searchInput: {
      minWidth: '340px',
    },
    datasourceItem: {
      '& + $datasourceItem': {
        marginTop: theme.spacing(1),
      },
    },
    totalCountText: {
      color: theme.palette.texts.info,
    },
  });

export type StylesType = WithStyles<typeof styles>;
