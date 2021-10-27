import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: { marginBottom: theme.spacing(1.5) },
    annotation: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(2),
    },
    tagsList: {
      marginTop: theme.spacing(1),
    },
    tagItem: { margin: theme.spacing(0.5, 0.5, 0.5, 0) },
    tagItemImportant: {
      backgroundColor: theme.palette.tag.important.normal.background,
    },
    tagInput: { marginTop: theme.spacing(1.5) },
    optionsContainer: {
      position: 'relative',
    },
    optionItem: {},
    importantOptionContainer: {
      '&:after': {
        position: 'absolute',
        content: '""',
        top: '9px',
        right: '-8px',
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        backgroundColor: theme.palette.tag.important.hover.background,
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
