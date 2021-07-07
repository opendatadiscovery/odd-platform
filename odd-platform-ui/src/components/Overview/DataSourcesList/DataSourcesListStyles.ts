import { Theme, createStyles, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    sectionCaption: {
      marginBottom: theme.spacing(2),
      paddingTop: theme.spacing(0.75),
    },
    listLinks: {
      padding: 0,
      margin: 0,
      listStyle: 'none',
      '& li': {
        marginBottom: '8px',
      },
    },
    listLink: {
      padding: theme.spacing(0.25),
      // display: 'inline-flex',
      // flexWrap: 'wrap',
      width: 'fit-content',
      textDecoration: 'none',
      cursor: 'pointer',
      color: '#091E42',
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
  });

export type StylesType = WithStyles<typeof styles>;
