import { createStyles, Theme, WithStyles } from '@material-ui/core';
import { colWidthStyles } from 'components/Search/Results/ResultsStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(1.25, 0),
    },
    ...colWidthStyles,
  });

export type StylesType = WithStyles<typeof styles>;
