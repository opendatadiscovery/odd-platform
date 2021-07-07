import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const searchHeight = 40;
export const styles = (theme: Theme) =>
  createStyles({
    inputInput: {
      padding: theme.spacing(0.25, 0.25, 0.25, 0.25),
      transition: theme.transitions.create('width'),
      width: '100%',
      border: '1px solid #0080FF',
      marginLeft: '4px',
      '&:hover': {
        border: '1px solid #0066CC',
      },
    },
    root: {
      color: theme.palette.common.black,
      width: '100%',
      boxSizing: 'border-box',
      '& .Mui-focused': {
        padding: '1px',
        border: '2px solid #0080FF',
      },
    },
    searchContainer: {
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'center',
    },
    search: {
      position: 'relative',
      width: '100%',
      maxWidth: '640px',
      height: `${searchHeight}px`,
    },
  });

export type StylesType = WithStyles<typeof styles>;
