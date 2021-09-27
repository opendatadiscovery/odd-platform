import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    checkboxContainer: {
      marginLeft: 0,
    },
    importantCheckbox: {
      width: '14px',
      height: '14px',
      marginRight: theme.spacing(1),
      padding: 0,
    },
    tagItemButtons: {
      margin: theme.spacing(1, 0, 1.5, 0),
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: theme.spacing(1.5),
      borderBottom: '1px solid',
      borderBottomColor: theme.palette.backgrounds.primary,
    },
  });

export type StylesType = WithStyles<typeof styles>;
