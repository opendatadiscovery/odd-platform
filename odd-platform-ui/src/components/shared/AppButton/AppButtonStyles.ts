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
      color: theme.palette.texts.hint,
    },
    primary: {
      backgroundColor: theme.palette.button.primary.normal.background,
      color: theme.palette.button.primary.normal.color,
      '&:hover': {
        backgroundColor: theme.palette.button.primary.hover.background,
      },
      '&:active': {
        backgroundColor: theme.palette.button.primary.active.background,
      },
      '&:disabled': {
        backgroundColor: theme.palette.button.primary.disabled?.background,
        color: theme.palette.button.primary.disabled?.color,
      },
    },
    primaryLight: {
      color: theme.palette.button.primaryLight.normal.color,
      backgroundColor: theme.palette.button.primaryLight.normal.background,
      '&:hover': {
        backgroundColor:
          theme.palette.button.primaryLight.hover.background,
      },
      '&:active': {
        backgroundColor:
          theme.palette.button.primaryLight.active.background,
      },
      '&:disabled': {
        backgroundColor:
          theme.palette.button.primaryLight.disabled?.background,
        color: theme.palette.button.primaryLight.disabled?.color,
      },
    },
    secondary: {
      backgroundColor: theme.palette.button.secondary.normal.background,
      '&:hover': {
        backgroundColor: theme.palette.button.secondary.hover.background,
        color: theme.palette.button.secondary.hover.color,
      },
      '&:active': {
        backgroundColor: theme.palette.button.secondary.active.background,
        color: theme.palette.button.secondary.active.color,
      },
      '&:disabled': {
        color: theme.palette.button.secondary.disabled?.color,
      },
    },
    tertiary: {
      borderRadius: '4px',
      lineHeight: '20px',
      height: '20px',
      padding: theme.spacing(0, 0.5),
      backgroundColor: theme.palette.button.tertiary.normal.background,
      '&:hover': {
        backgroundColor: theme.palette.button.tertiary.hover.background,
      },
      '&:active': {
        backgroundColor: theme.palette.button.tertiary.active.background,
        color: theme.palette.button.tertiary.active.color,
      },
    },
    dropdown: {
      lineHeight: '20px',
      height: '20px',
      backgroundColor: 'transparent',
      color: theme.palette.button.dropdown.normal.color,
      '&:hover': {
        backgroundColor: theme.palette.button.tertiary.hover.background,
        color: theme.palette.button.tertiary.hover.color,
      },
      '&:active': { color: theme.palette.button.tertiary.active.color },
    },
    expand: {
      width: '21px',
      padding: '6.5px 4px',
      color: theme.palette.button.expand.normal.color,
      backgroundColor: theme.palette.button.expand.normal.background,
      '&:hover': {
        backgroundColor: theme.palette.button.expand.hover.background,
      },
      '&:active': {
        backgroundColor: theme.palette.button.expand.active.background,
        color: theme.palette.button.expand.active.color,
      },
      '& .MuiSvgIcon-root': { width: '13px' },
    },
    unfilled: {
      color: theme.palette.button.unfilled.normal.color,
      '&:hover': { color: theme.palette.button.unfilled.hover.color },
      '&:active': { color: theme.palette.button.unfilled.active.color },
    },
  });

export type StylesType = WithStyles<typeof styles>;
