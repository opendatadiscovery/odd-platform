import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    caption: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(0.5),
      color: '#7A869A',
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
    highlightedOption: { backgroundColor: '#FFEECC', borderRadius: '2px' },
    filterCount: { color: '#A8B0BD' },
    autoComplete: {
      width: '192px',
    },
  });

export type StylesType = WithStyles<typeof styles>;
