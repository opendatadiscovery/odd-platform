import { Theme, createStyles, WithStyles } from '@material-ui/core';

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
    tableHeader: {
      borderBottom: '1px solid',
      borderBottomColor: '#F4F5F7',
      '& > *': {
        padding: theme.spacing(0, 1),
      },
    },
    tableRow: {
      padding: theme.spacing(1.5, 1),
      borderBottom: '1px solid',
      borderBottomColor: '#F4F5F7',
      '&:hover': {
        backgroundColor: '#F4F5F7',
        '& $rowActions': {
          opacity: 1,
        },
      },
    },
    rowName: { color: '#A8B0BD' },
    rowActions: {
      opacity: 0,
      '& > * + *': {
        marginLeft: theme.spacing(1),
      },
    },
    spinnerContainer: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: theme.spacing(1),
    },
    caption: {
      marginBottom: theme.spacing(2),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: 'calc(100% - 8px)',
    },
    totalCountText: {
      color: '#42526E',
    },
    searchInput: {
      minWidth: '340px',
    },
    listContainer: {
      width: '100%',
    },
  });

export type StylesType = WithStyles<typeof styles>;
