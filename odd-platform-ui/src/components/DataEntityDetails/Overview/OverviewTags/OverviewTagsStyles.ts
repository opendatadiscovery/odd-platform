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
      marginBottom: theme.spacing(2.25),
    },
    caption: {},
    tagsContainer: { margin: theme.spacing(0, -0.5, 0, -0.5) },
    tagItem: { margin: theme.spacing(0.5) },
  });

export type StylesType = WithStyles<typeof styles>;
