import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    pickerErrorMessage: {
      '& .MuiFormHelperText-contained': {
        marginLeft: '2px',
      },
      '& .MuiFormHelperText-root': {
        fontSize: '.8rem',
      },
    },
    formErrorContainer: {
      position: 'relative',
    },
    pickerInput: { width: '100%' },
    pickerAdornment: { marginRight: theme.spacing(1.5) },
    formErrorMessage: {
      position: 'absolute',
      top: '-8px',
      right: '28px',
      margin: 0,
      color: theme.palette.warning.light,
      fontSize: theme.typography.body1.fontSize,
      whiteSpace: 'nowrap',
    },
    radioGroup: {
      marginLeft: theme.spacing(1),
    },
  });

export type StylesType = WithStyles<typeof styles>;
