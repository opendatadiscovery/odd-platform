import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

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
      borderBottomColor: theme.palette.backgrounds.primary,
      '& > *': {
        padding: theme.spacing(0, 1),
      },
    },
    rowName: { color: theme.palette.texts.hint },
    caption: {
      marginBottom: theme.spacing(2),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: 'calc(100% - 8px)',
    },
    ownersItem: { display: 'flex', flexWrap: 'wrap' },
    totalCountText: {
      color: theme.palette.texts.info,
    },
    searchInput: {
      minWidth: '340px',
    },
  });

export type StylesType = WithStyles<typeof styles>;
