import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      fontSize: theme.typography.body2.fontSize,
      lineHeight: theme.typography.body2.lineHeight,
    },
    noResultText: { color: theme.palette.text.secondary },
    createNewOptionText: {
      color: theme.palette.button?.dropdown.normal.color,
    },
  });

export type StylesType = WithStyles<typeof styles>;
