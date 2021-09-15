import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      alignItems: 'center',
      '&:hover $actions': {
        opacity: 1,
      },
    },
    labelContainer: {
      display: 'flex',
      overflow: 'hidden',
    },
    label: {
      wordBreak: 'break-word',
      maxHeight: '5rem',
      overflow: 'auto',
      paddingRight: theme.spacing(1),
    },
    valueContainer: {
      padding: theme.spacing(0.5),
      border: '1px solid',
      borderColor: 'transparent',
      borderRadius: '4px',
      '&:hover': {
        borderColor: theme.palette.divider,
      },
    },
    value: {
      display: 'inline',
      wordBreak: 'break-word',
      maxHeight: '5rem',
      overflow: 'auto',
    },
    actions: {
      opacity: 0,
      marginLeft: theme.spacing(0.5),
      display: 'inline',
    },
    editForm: {
      display: 'flex',
      width: '100%',
      alignItems: 'center',
    },
    formActionBtns: {
      display: 'flex',
      alignItems: 'center',
      marginLeft: theme.spacing(1),
      '& > * + *': {
        marginLeft: theme.spacing(0.5),
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
