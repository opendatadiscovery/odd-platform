import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      justifyContent: 'space-between',
      flexWrap: 'nowrap',
      flexDirection: 'column',
    },
    testReportHeader: {
      cursor: 'pointer',
      paddingBottom: theme.spacing(0.75),
    },
    testReportBySuitNameContainer: {
      flexWrap: 'nowrap',
      justifyContent: 'flex-end',
    },
  });

export type StylesType = WithStyles<typeof styles>;
