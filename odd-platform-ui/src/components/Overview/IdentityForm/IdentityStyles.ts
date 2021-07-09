import { Theme, createStyles, WithStyles } from '@material-ui/core';

const maxContentWidth = '320px';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(4),
      padding: theme.spacing(4.5, 3, 4, 3),
      border: '1px solid',
      borderColor: '#EBECF0',
      borderRadius: '8px',
    },
    captionIcon: {
      width: '76px',
      height: '41px',
    },
    caption: {
      marginTop: theme.spacing(2),
    },
    formContainer: {
      width: '100%',
      maxWidth: maxContentWidth,
      marginTop: theme.spacing(1.75),
    },
    submitBtn: {
      marginTop: theme.spacing(2),
    },
    suggestedOwnersContainer: {
      width: '100%',
      maxWidth: maxContentWidth,
      marginTop: theme.spacing(1),
    },
    suggestedOwnerItem: {
      cursor: 'pointer',
      padding: theme.spacing(0.25),
      marginTop: theme.spacing(0.75),
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
