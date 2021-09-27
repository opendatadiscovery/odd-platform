import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      display: 'inline-flex',
      alignItems: 'center',
      border: '1px solid',
      borderColor: theme.palette.tag.main.normal.border,
      borderRadius: '4px',
      padding: theme.spacing(0.25, 1),
      color: theme.palette.tag.main.normal.color,
      '&:hover': {
        borderColor: theme.palette.tag.main.hover.border,
      },
      '&:active': {
        borderColor: theme.palette.tag.main.active.border,
      },
    },
    important: {
      borderColor: theme.palette.tag.important.normal.border,
      '&:hover, &:active': {
        borderColor: theme.palette.tag.important.hover.border,
      },
    },
    containerRemovable: {
      paddingRight: theme.spacing(0.5),
    },
    removeBtn: {
      marginLeft: theme.spacing(0.25),
    },
  });

export type StylesType = WithStyles<typeof styles>;
