import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const primaryTabsHeight = 32;
export const styles = (theme: Theme) =>
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
          borderBottom: '1px solid #C1C7D0',
        },
      },
      '&.secondary': {
        minHeight: '24px',
        backgroundColor: '#EBECF0',
        padding: theme.spacing(0.5),
        borderRadius: theme.spacing(1),
      },
      '&.secondarySmall': {
        minHeight: '24px',
        height: '24px',
        backgroundColor: '#EBECF0',
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
        backgroundColor: '#0066CC',
      },
    },
    tabItem: {
      color: '#7A869A',
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
          color: '#42526E',
          borderColor: '#0066CC',
        },
      },
      '&.secondary': {
        minHeight: '24px',
        minWidth: '91px',
        padding: theme.spacing(0.25),
        '&:hover': { color: '#091E42' },
      },
      '&.secondarySmall': {
        minHeight: '24px',
        minWidth: '44px',
        '&:hover': { color: '#42526E' },
      },
      '&.menu': {
        minWidth: '65px',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        minHeight: '32px',
        '&:hover': {
          color: '#7A869A',
          backgroundColor: '#F4F5F7',
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
        backgroundColor: '#F4F5F7',
        padding: '0 4px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '500',
        lineHeight: '16px',
        color: '#7A869A',
      },
    },
    tabItemSelected: {
      color: '#091E42',
      '&.primary': {},
      '&.secondary': {
        height: '24px',
        backgroundColor: '#ffffff',
        borderRadius: theme.spacing(0.5),
      },
      '&.secondarySmall': {
        color: '#42526E',
        height: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid #C1C7D0',
        borderRadius: theme.spacing(2),
      },
      '&.menu': {
        color: '#091E42',
        backgroundColor: '#EBECF0',
      },
    },
    hintContainer: {
      display: 'flex',
      alignItems: 'center',
      height: '16px',
    },
  });

export type StylesType = WithStyles<typeof styles>;
