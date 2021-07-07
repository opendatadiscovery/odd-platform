import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      padding: '4px 13px 4px 8px',
      borderRadius: '16px',
      backgroundColor: '#E5F2FF',
      '&:hover': {
        boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
      },
    },
    transparent: {
      backgroundColor: 'transparent',
    },
    withoutText: {
      padding: '4px',
    },
    icon: {
      padding: '3px',
      color: '#0066CC',
      width: '22px',
      height: '22px',
    },
    text: {
      padding: 0,
      marginLeft: '4px',
      color: '#0066CC',
      fontSize: '.85rem',
      textTransform: 'none',
      lineHeight: '1.1rem',
    },
  });

export type StylesType = WithStyles<typeof styles>;
