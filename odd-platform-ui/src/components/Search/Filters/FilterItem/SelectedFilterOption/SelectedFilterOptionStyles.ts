import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {},
    content: {
      display: 'flex',
      cursor: 'pointer',
      fontSize: theme.typography.body1.fontSize,
      maxWidth: '100%',
      color: theme.palette.text.info,
      backgroundColor: theme.palette.background.primary,
      borderRadius: '2px',
      padding: theme.spacing(0, 0.75, 0, 0.5),
      alignItems: 'center',
      justifyContent: 'space-between',
      '&:hover': {
        backgroundColor: theme.palette.divider,
      },
    },
    removeBtn: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.palette.text.hint,
      marginLeft: theme.spacing(1),
      width: '8px',
      height: '8px',
      padding: 0,
    },
  });

export type StylesType = WithStyles<typeof styles>;
