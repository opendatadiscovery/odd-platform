import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

const maxContentWidth = '320px';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(4),
      padding: theme.spacing(4.5, 3, 4, 3),
      border: '1px solid',
      borderColor: theme.palette.divider,
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
        backgroundColor: theme.palette.background.primary,
        borderRadius: '4px',
        '& > *': {
          color: theme.palette.text.primary,
        },
      },
      '&:active': {
        backgroundColor: theme.palette.background.secondary,
      },
    },
  });

export type StylesType = WithStyles<typeof styles>;
