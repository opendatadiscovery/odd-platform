import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    annotation: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(2),
    },
    tagsList: {
      marginTop: theme.spacing(1),
    },
    tagItem: { margin: theme.spacing(0.5, 0.5, 0.5, 0) },
    tagItemImportant: { backgroundColor: '#FFBB33' },
    tagInput: {},
    optionsContainer: {
      position: 'relative',
    },
    optionItem: {},
    importantOptionContainer: {
      '&:after': {
        position: 'absolute',
        content: '""',
        top: '7px',
        right: '-8px',
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        backgroundColor: '#FFAA00',
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
