import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const primaryTabsHeight = 32;
export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      '&.primary': { marginBottom: theme.spacing(3) },
    },
    tabsContainer: {
      alignItems: 'center',
      '&.primary': {
        position: 'relative',
        minHeight: `${primaryTabsHeight}px`,
        '&::after': {
          position: 'absolute',
          content: '""',
          bottom: '0px',
          width: '100%',
          zIndex: '-1',
          borderBottom: '1px solid',
          borderBottomColor: theme.palette.info.light,
        },
      },
      '&.secondary': {
        minHeight: '24px',
        backgroundColor: theme.palette.background.secondary,
        padding: theme.spacing(0.5),
        borderRadius: theme.spacing(1),
      },
      '&.secondarySmall': {
        minHeight: '24px',
        height: '24px',
        backgroundColor: theme.palette.background.secondary,
        borderRadius: theme.spacing(2),
      },
      '&.menu': {
        minHeight: '32px',
      },
      '&.vertical': { alignItems: 'flex-start' },
      '&.vertical .MuiTabs-scrollable .MuiTabs-flexContainerVertical': {
        alignItems: 'flex-start',
      },
    },
    tabIndicator: {
      display: 'none',
      '&.primary': {
        display: 'block',
        height: '1px',
        borderRadius: '1px',
        backgroundColor: theme.palette.button?.secondary.hover.background,
      },
    },
    tabItem: {
      color: theme.palette.text.secondary,
      fontSize: theme.typography.body1.fontSize,
      textTransform: 'none',
      '&.primary': {
        padding: theme.spacing(0.75, 1),
        lineHeight: 1,
        minWidth: 'auto',
        opacity: 1,
        borderBottom: '1px solid transparent',
        '& + $tabItem': { marginLeft: theme.spacing(2) },
        '&[hidden]': {
          display: 'none',
        },
        '&:hover': {
          color: theme.palette.text.info,
          borderColor: theme.palette.button?.secondary.hover.background,
        },
      },
      '&.secondary': {
        minHeight: '24px',
        minWidth: '91px',
        padding: theme.spacing(0.25),
        '&:hover': { color: theme.palette.text.primary },
      },
      '&.secondarySmall': {
        minHeight: '24px',
        minWidth: '44px',
        '&:hover': { color: theme.palette.text.info },
      },
      '&.menu': {
        minWidth: '65px',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        minHeight: '32px',
        '&:hover': {
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.background.primary,
        },
        '&.vertical': { marginBottom: theme.spacing(0.5) },
        '&:not(.vertical)': { marginRight: theme.spacing(0.5) },
      },
      '&.vertical .MuiTab-wrapper': {
        alignItems: 'flex-start',
      },
    },
    tabItemLabel: {
      display: 'flex',
      alignItems: 'center',
      '& span': {
        alignSelf: 'center',
        marginLeft: '4px',
        verticalAlign: 'middle',
        backgroundColor: theme.palette.background.primary,
        padding: '0 4px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '500',
        lineHeight: '16px',
        color: theme.palette.text.secondary,
      },
    },
    tabItemSelected: {
      color: theme.palette.text.primary,
      '&.primary': {},
      '&.secondary': {
        height: '24px',
        backgroundColor: theme.palette.background.default,
        borderRadius: theme.spacing(0.5),
      },
      '&.secondarySmall': {
        color: theme.palette.text.info,
        height: '24px',
        backgroundColor: theme.palette.background.default,
        border: '1px solid',
        borderColor: theme.palette.info.light,
        borderRadius: theme.spacing(2),
      },
      '&.menu': {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.secondary,
      },
    },
    hintContainer: {
      display: 'flex',
      alignItems: 'center',
      height: '16px',
      '& > span': { minWidth: '18px' },
    },
  });

export type StylesType = WithStyles<typeof styles>;
