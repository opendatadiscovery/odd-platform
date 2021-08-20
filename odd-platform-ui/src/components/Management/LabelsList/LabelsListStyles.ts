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
    labelsTableHeader: {
      borderBottom: '1px solid #EBECF0',
      '& > *': {
        padding: theme.spacing(0, 1),
      },
    },
    rowName: { color: '#A8B0BD' },
    caption: {
      marginBottom: theme.spacing(2),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: 'calc(100% - 8px)',
    },
    labelsItem: { display: 'flex', flexWrap: 'wrap' },
    totalCountText: {
      color: '#42526E',
    },
    searchInput: {
      minWidth: '340px',
    },
  });

export type StylesType = WithStyles<typeof styles>;
