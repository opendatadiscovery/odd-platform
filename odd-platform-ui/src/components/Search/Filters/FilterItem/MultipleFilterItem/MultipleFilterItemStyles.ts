import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {},
    caption: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(0.5),
      color: theme.palette.text.secondary,
    },
    selectedOptionsContainer: {
      display: 'inline-flex',
      margin: '2px -2px',
    },
    selectedOption: {
      display: 'flex',
      margin: '2px',
      marginTop: theme.spacing(0.5),
    },
    highlightedOption: {
      backgroundColor: theme.palette.warning.light,
      borderRadius: '2px',
    },
    filterCount: { color: theme.palette.text.hint },
    autoComplete: {
      width: '192px',
    },
  });

export type StylesType = WithStyles<typeof styles>;
