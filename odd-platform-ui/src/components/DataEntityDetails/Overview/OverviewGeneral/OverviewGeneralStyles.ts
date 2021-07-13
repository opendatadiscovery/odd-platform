import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {},
    addOwnerBtn: {
      marginTop: theme.spacing(0.25),
    },
    ownershipList: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    generalItem: {
      padding: '1px 8px !important',
    },
    ownerItem: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid',
      borderRadius: '5px',
      borderColor: 'transparent',
      padding: '3px',
      marginTop: theme.spacing(0.25),
      '&:hover': {
        borderColor: '#CCE6FF',
        '& $ownerActionBtns': {
          opacity: 1,
        },
      },
    },
    ownerRole: {
      color: '#7A869A',
      backgroundColor: '#EBECF0',
      padding: theme.spacing(0, 0.25),
      marginLeft: theme.spacing(0.5),
      marginRight: theme.spacing(0.25),
      borderRadius: '2px',
    },
    ownerActionBtns: {
      opacity: 0,
      marginLeft: theme.spacing(1.25),
    },
  });

export type StylesType = WithStyles<typeof styles>;
