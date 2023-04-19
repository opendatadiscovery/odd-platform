import {
  buttonBaseClasses,
  Tab,
  tabClasses,
  type TabProps,
  type TabsProps,
} from '@mui/material';
import { type Theme } from '@mui/material/styles';
import { type TabType } from 'components/shared/elements/AppTabs/interfaces';
import styled, { type CSSObject } from 'styled-components';

const getTabStylesByType = (theme: Theme, type: TabType): CSSObject => {
  switch (type) {
    case 'primary':
      return {
        minHeight: '32px',
        padding: theme.spacing(0.75, 1),
        lineHeight: 1,
        minWidth: 'auto',
        opacity: 1,
        borderBottom: '1px solid transparent',
        marginRight: theme.spacing(0.5),
        '&:last-child': { marginRight: 0 },
        '&:hover': {
          color: theme.palette.texts.info,
          borderColor: theme.palette.button?.secondary.hover.background,
        },
      };
    case 'secondary':
      return {
        minHeight: '24px',
        minWidth: '91px',
        padding: theme.spacing(0.25),
        '&:hover': { color: theme.palette.texts.primary },
      };
    case 'secondarySmall':
      return {
        minHeight: '24px',
        minWidth: '44px',
        padding: theme.spacing(0.25, 1.5),
        '&:hover': { color: theme.palette.texts.primary },
      };
    case 'menu':
      return {
        [`&.${tabClasses.root}`]: {
          alignItems: 'flex-start',
        },
        minWidth: '65px',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        minHeight: '32px',
        marginRight: theme.spacing(0.5),
        '&:last-child': { marginRight: 0 },
        '&:hover': {
          color: theme.palette.texts.secondary,
          backgroundColor: theme.palette.backgrounds.primary,
        },
      };
    default:
      return {};
  }
};

const getSelectedTabStylesByType = (theme: Theme, type: TabType): CSSObject => {
  switch (type) {
    case 'primary':
      return {};
    case 'secondary':
      return {
        height: '24px',
        backgroundColor: theme.palette.background.default,
        borderRadius: theme.spacing(0.5),
      };
    case 'secondarySmall':
      return {
        color: theme.palette.texts.info,
        height: '24px',
        backgroundColor: theme.palette.background.default,
        border: '1px solid',
        borderColor: theme.palette.info.light,
        borderRadius: theme.spacing(2),
      };
    case 'menu':
      return {
        color: theme.palette.texts.primary,
        backgroundColor: theme.palette.backgrounds.secondary,
      };
    default:
      return {};
  }
};

const tabStyles = (
  theme: Theme,
  type: TabType,
  $hidden?: boolean,
  $orientation?: TabsProps['orientation']
): CSSObject => ({
  [`&.${buttonBaseClasses.root}`]: {
    [`&.${tabClasses.root}`]: {
      display: $hidden ? 'none' : 'flex',
      alignItems: $orientation === 'vertical' ? 'flex-start' : 'center',
      '&:hover, &:active, &:focus': { textDecoration: 'none' },
    },
  },
  [`&.${tabClasses.selected}`]: {
    color: theme.palette.texts.primary,
    ...getSelectedTabStylesByType(theme, type),
    alignItems: 'center',
  },

  padding: theme.spacing(0.75, 1.5),
  color: theme.palette.texts.secondary,
  fontSize: theme.typography.body1.fontSize,
  textTransform: 'none',
  ...getTabStylesByType(theme, type),
});

export const TabContainer = styled(Tab)<{
  $type: TabType;
  $hidden?: boolean;
  $orientation?: TabsProps['orientation'];
}>(({ theme, $type, $hidden, $orientation }) =>
  tabStyles(theme, $type, $hidden, $orientation)
);

export const LinkTabContainer = styled(Tab)<
  {
    $type: TabType;
    $hidden?: boolean;
    $orientation?: TabsProps['orientation'];
  } & TabProps
>(({ theme, $type, $hidden, $orientation }) =>
  tabStyles(theme, $type, $hidden, $orientation)
);
