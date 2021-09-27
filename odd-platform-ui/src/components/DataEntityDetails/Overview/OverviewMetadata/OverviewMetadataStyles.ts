import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    subtitle: {},
    subtitleContainer: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(1),
    },
    collapseContainer: { marginTop: theme.spacing(0.5) },
    viewAllBtn: {
      marginTop: theme.spacing(0.75),
    },
  });

export type StylesType = WithStyles<typeof styles>;
