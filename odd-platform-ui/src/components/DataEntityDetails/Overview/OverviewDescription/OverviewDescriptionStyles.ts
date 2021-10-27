import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    captionContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(0.5),
    },
    caption: {},
    preview: {
      fontSize: theme.typography.body1.fontSize,
      fontFamily: 'inherit',
      fontWeight: theme.typography.body1.fontWeight,
      lineHeight: theme.typography.body1.lineHeight,
      color: theme.palette.text.secondary,
    },
    formActions: {
      marginTop: theme.spacing(2),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
  });

export type StylesType = WithStyles<typeof styles>;
