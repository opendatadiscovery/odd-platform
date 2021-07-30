import { Theme, createStyles, WithStyles } from '@material-ui/core';

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
      color: '#091E42',
      flexWrap: 'nowrap',
      '&:hover': {
        backgroundColor: '#F4F5F7',
        borderRadius: '4px',
        '& > *': {
          color: '#091E42',
        },
      },
      '&:active': {
        backgroundColor: '#EBECF0',
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
      color: '#000000',
      display: 'flex',
      alignItems: 'center',
      '& > svg ': {
        marginRight: theme.spacing(0.5),
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
