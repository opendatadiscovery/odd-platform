import {
  createStyles,
  Theme,
  withStyles,
  ButtonBase,
} from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: 0,
      color: theme.palette.primary.main,
      fontSize: '1rem',
      textTransform: 'none',
      lineHeight: '1.1rem',
      boxSizing: 'border-box',
      textUnderlineOffset: '3px',
      '&:hover': { textDecoration: 'underline' },
    },
  });

const TextButton = withStyles(styles)(ButtonBase);

export default TextButton;
