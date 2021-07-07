import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      padding: '2px',
      marginLeft: '4px',
    },
    icon: {
      width: '16px',
      height: '16px',
      color: theme.palette.text.hint,
    },
    primary: {
      backgroundColor: '#0080FF',
      color: '#FFFFFF',
      '&:hover': { backgroundColor: '#0066CC' },
      '&:active': { backgroundColor: '#0059B2' },
      '&:disabled': { backgroundColor: '#99CCFF', color: '#FFFFFF' },
    },
    primaryLight: {
      color: '#0066CC',
      backgroundColor: '#E5F2FF',
      '&:hover': { backgroundColor: '#CCE6FF' },
      '&:active': { backgroundColor: '#99CCFF' },
      '&:disabled': { backgroundColor: '#E5F2FF', color: '#99CCFF' },
    },
    secondary: {
      backgroundColor: '#FFFFFF',
      '&:hover': { backgroundColor: '#0080FF', color: '#FFFFFF' },
      '&:active': { backgroundColor: '#0066CC', color: '#FFFFFF' },
      '&:disabled': { color: '#99CCFF' },
    },
    tertiary: {
      borderRadius: '4px',
      lineHeight: '20px',
      height: '20px',
      padding: theme.spacing(0, 0.5),
      backgroundColor: '#FFFFFF',
      '&:hover': { backgroundColor: '#E5F2FF' },
      '&:active': { backgroundColor: '#CCE6FF', color: '#0059B2' },
    },
    dropdown: {
      lineHeight: '20px',
      height: '20px',
      backgroundColor: 'transparent',
      color: '#0080FF',
      '&:hover': { backgroundColor: 'transparent', color: '#0066CC' },
      '&:active': { color: '#0059B2' },
    },
    expand: {
      width: '21px',
      padding: '6.5px 4px',
      color: '#0066CC',
      backgroundColor: '#E5F2FF',
      '&:hover': { backgroundColor: '#CCE6FF' },
      '&:active': { backgroundColor: '#0080FF', color: '#FFFFFF' },
      '& .MuiSvgIcon-root': { width: '13px' },
    },
    unfilled: {
      color: '#B3BAC5',
      '&:hover': { color: '#7A869A' },
      '&:active': { color: '#42526E' },
    },
  });

export type StylesType = WithStyles<typeof styles>;
