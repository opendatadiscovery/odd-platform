import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    listLinks: {
      padding: 0,
      listStyle: 'none',
      '& li': {
        marginBottom: '8px',
        '& a': {},
      },
    },
    listLink: {
      overflow: 'hidden',
      padding: theme.spacing(0.25),
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      color: theme.palette.texts?.primary,
      flexWrap: 'nowrap',
      '&:hover': {
        backgroundColor: theme.palette.backgrounds.primary,
        borderRadius: '4px',
        '& > *': {
          color: theme.palette.texts?.primary,
        },
      },
      '&:active': {
        backgroundColor: theme.palette.backgrounds.secondary,
      },
    },
    alert: {
      marginRight: theme.spacing(0.5),
    },
    entityTypeItem: {
      marginLeft: theme.spacing(0.5),
    },
    sectionCaption: {
      marginBottom: theme.spacing(2),
      paddingTop: theme.spacing(0.75),
      color: theme.palette.texts?.primary,
      display: 'flex',
      alignItems: 'center',
      '& > svg ': {
        marginRight: theme.spacing(0.5),
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
