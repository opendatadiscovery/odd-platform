import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      width: '100%',
      marginTop: theme.spacing(2),
    },
    testRunItemContainer: {
      marginBottom: theme.spacing(1),
      alignItems: 'center',
      '& + $testRunItemContainer': {
        paddingTop: theme.spacing(1),
        borderTop: '1px solid',
        borderTopColor: theme.palette.divider,
      },
    },
    testRunInfoItem: {
      '& + $testRunInfoItem': {
        marginTop: theme.spacing(1),
      },
    },
    statusReason: {
      color: theme.palette.text.secondary,
      marginLeft: theme.spacing(1),
    },
  });

export type StylesType = WithStyles<typeof styles>;
