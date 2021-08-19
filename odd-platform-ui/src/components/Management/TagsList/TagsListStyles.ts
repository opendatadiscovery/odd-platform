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
    col: {
      minWidth: '285px',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
    },
    caption: {
      marginBottom: theme.spacing(2),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: 'calc(100% - 8px)',
    },
    tagsTableHeader: {
      flexWrap: 'nowrap',
      paddingLeft: theme.spacing(1),
      borderBottom: '1px solid #EBECF0',
    },
    rowName: { color: '#A8B0BD' },
    listContainer: {
      '& > :first-child': {
        width: '100%',
      },
    },
    tagsItem: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    totalCountText: {
      color: '#42526E',
    },
    searchInput: {
      minWidth: '340px',
    },
  });

export type StylesType = WithStyles<typeof styles>;
