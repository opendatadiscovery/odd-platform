import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    annotation: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(2),
    },
    labelsList: {
      marginTop: theme.spacing(1),
    },
    labelItem: { margin: theme.spacing(0.5, 0) },
    labelInput: {},
    optionsContainer: {},
    optionItem: {},
  });

export type StylesType = WithStyles<typeof styles>;
