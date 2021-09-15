import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
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
      borderBottom: '1px solid',
      borderBottomColor: theme.palette.divider,
      '& > *': {
        padding: theme.spacing(0, 1),
      },
    },
    rowName: { color: theme.palette.text.hint },
    caption: {
      marginBottom: theme.spacing(2),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: 'calc(100% - 8px)',
    },
    labelsItem: { display: 'flex', flexWrap: 'wrap' },
    totalCountText: {
      color: theme.palette.text.info,
    },
    searchInput: {
      minWidth: '340px',
    },
  });

export type StylesType = WithStyles<typeof styles>;
