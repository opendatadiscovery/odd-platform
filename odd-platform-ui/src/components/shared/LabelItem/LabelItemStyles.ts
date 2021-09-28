import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      display: 'inline-flex',
      alignItems: 'center',
      backgroundColor: theme.palette.backgrounds.secondary,
      borderRadius: '2px',
      padding: theme.spacing(0, 0.25),
      color: theme.palette.texts.info,
      position: 'relative',
      margin: theme.spacing(0.25),
    },
    containerRemovable: {
      paddingRight: theme.spacing(0.5),
    },
    unfilled: {
      backgroundColor: theme.palette.background.default,
      border: '1px solid',
      borderColor: theme.palette.divider,
      borderRadius: '4px',
      padding: theme.spacing(0.25, 0.5, 0.25, 1),
      color: theme.palette.texts.info,
    },
    removeBtn: {
      marginLeft: theme.spacing(0.25),
    },
  });

export type StylesType = WithStyles<typeof styles>;
