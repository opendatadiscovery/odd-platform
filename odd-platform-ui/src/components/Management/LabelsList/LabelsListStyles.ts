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
    caption: {
      marginBottom: theme.spacing(2),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: 'calc(100% - 8px)',
    },
    labelsTableHeader: {
      flexWrap: 'nowrap',
      '& > *': {
        borderBottom: '1px solid #EBECF0',
        padding: theme.spacing(0, 1),
      },
    },
    rowName: { color: '#A8B0BD' },
    listContainer: {
      width: '100%',
    },
    labelsItem: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    spinnerContainer: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: theme.spacing(1),
    },
    totalCountText: {
      color: '#42526E',
    },
    searchInput: {
      minWidth: '340px',
    },
  });

export type StylesType = WithStyles<typeof styles>;
