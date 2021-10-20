import { Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import { toolbarHeight } from 'lib/constants';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(2, 1, 1.5, 1),
    },
    caption: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(1),
    },
    listContainer: {
      height: `calc(100vh - 110px - ${toolbarHeight}px)`,
    },
    facetsLoaderContainer: {
      padding: theme.spacing(0, 3),
      marginTop: theme.spacing(2),
    },
  });

export type StylesType = WithStyles<typeof styles>;
