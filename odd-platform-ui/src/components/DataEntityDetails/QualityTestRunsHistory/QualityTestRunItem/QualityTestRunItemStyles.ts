import { Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import { colWidthStyles } from '../QualityTestRunsHistoryStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      flexWrap: 'nowrap',
      padding: theme.spacing(1.5, 0),
      borderBottom: '1px solid #EBECF0',
    },
    ...colWidthStyles,
  });

export type StylesType = WithStyles<typeof styles>;
