import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    ownershipList: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    ownersContainer: { marginTop: theme.spacing(2) },
    ownerItem: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid',
      borderRadius: '5px',
      borderColor: 'transparent',
      padding: '3px',
      marginTop: theme.spacing(0.25),
      '&:hover': {
        borderColor: theme.palette.button?.primaryLight.hover.border,
        '& $ownerActionBtns': {
          opacity: 1,
        },
      },
    },
    ownerRole: {
      color: theme.palette.text.secondary,
      backgroundColor: theme.palette.backgrounds.secondary,
      padding: theme.spacing(0, 0.25),
      marginLeft: theme.spacing(0.5),
      marginRight: theme.spacing(0.25),
      borderRadius: '2px',
    },
    ownerActionBtns: {
      opacity: 0,
    },
  });

export type StylesType = WithStyles<typeof styles>;
