import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      fontSize: theme.typography.body2.fontSize,
      lineHeight: theme.typography.body2.lineHeight,
    },
    noResultText: { color: '#7A869A' },
    createNewOptionText: { color: '#0080FF' },
  });

export type StylesType = WithStyles<typeof styles>;
