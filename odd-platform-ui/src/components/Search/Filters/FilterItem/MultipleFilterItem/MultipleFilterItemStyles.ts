import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
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
    filterCount: { color: theme.palette.texts.hint },
    autoComplete: {
      width: '192px',
    },
  });

export type StylesType = WithStyles<typeof styles>;
