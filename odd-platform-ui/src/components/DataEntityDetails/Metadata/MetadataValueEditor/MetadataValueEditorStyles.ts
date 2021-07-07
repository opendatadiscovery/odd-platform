import { createStyles, Theme, WithStyles } from '@material-ui/core';

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
