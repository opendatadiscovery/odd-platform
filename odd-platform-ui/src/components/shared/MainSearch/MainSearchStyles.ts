import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const searchHeight = 40;
export const styles = (theme: Theme) =>
  createStyles({
    inputInput: {
      height: `${searchHeight}px`,
      transition: theme.transitions.create('width'),
      width: '100%',
      border: '1px solid',
      borderColor: theme.palette.button.primary.normal.border,
      marginLeft: '4px',
      '&:hover': {
        border: '1px solid',
        borderColor: theme.palette.button.primaryLight.normal.color,
      },
    },
    clearIconContainer: {
      right: '5px',
      top: 'auto',
    },
    autocomplete: {
      color: theme.palette.common.black,
      width: '100%',
      boxSizing: 'border-box',
      '& .Mui-focused': {
        border: '2px solid',
        borderColor: theme.palette.button.primary.normal.border,
      },
    },
    searchContainer: {
      flexGrow: 1,
      display: 'flex',
      width: '100%',
      maxWidth: '640px',
    },
    search: {
      width: '100%',
    },
    suggestionItem: {
      display: 'flex',
      alignItems: 'center',
      flexGrow: 1,
    },
    name: { marginRight: theme.spacing(1) },
  });

export type StylesType = WithStyles<typeof styles>;
