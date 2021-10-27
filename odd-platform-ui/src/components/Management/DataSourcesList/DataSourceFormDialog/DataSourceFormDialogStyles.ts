import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    formElement: {},
    dialogActions: {},
    intervalContainer: {
      marginTop: theme.spacing(1.5),
    },
    asterisk: {
      color: theme.palette.warning.main,
    },
    checkboxContainer: {
      margin: theme.spacing(1.5, 0, 0, 0),
    },
    pullingCheckbox: {
      width: '14px',
      height: '14px',
      marginRight: theme.spacing(1),
      padding: 0,
    },
    formTitle: {
      fontSize: '0.73rem',
    },
  });

export type StylesType = WithStyles<typeof styles>;
