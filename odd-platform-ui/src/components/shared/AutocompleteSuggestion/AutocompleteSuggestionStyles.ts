import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      fontSize: theme.typography.body2.fontSize,
      lineHeight: theme.typography.body2.lineHeight,
    },
    noResultText: { color: theme.palette.texts.secondary },
    createNewOptionText: {
      color: theme.palette.button.dropdown.normal.color,
    },
  });

export type StylesType = WithStyles<typeof styles>;
