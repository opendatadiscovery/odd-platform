import { tabClasses, Tabs, tabsClasses } from '@mui/material';
import { primaryTabsHeight } from 'lib/constants';
import styled, { type CSSObject } from 'styled-components';
import { type TabType } from 'components/shared/elements/AppTabs/interfaces';

export const TabsContainer = styled(Tabs)<{ $type: TabType }>(({ theme, $type }) => {
  const getTabsVariants = (type: TabType): CSSObject => {
    switch (type) {
      case 'primary':
        return {
          position: 'relative',
          minHeight: `${primaryTabsHeight}px`,
          '&::after': {
            position: 'absolute',
            content: '""',
            bottom: '0px',
            width: '100%',
            zIndex: -1,
            borderBottom: '1px solid',
            borderBottomColor: theme.palette.info.light,
          },
        };
      case 'secondary':
        return {
          minHeight: '24px',
          backgroundColor: theme.palette.backgrounds.secondary,
          padding: theme.spacing(0.5),
          borderRadius: theme.spacing(1),
        };
      case 'secondarySmall':
        return {
          minHeight: '24px',
          height: '24px',
          backgroundColor: theme.palette.backgrounds.secondary,
          borderRadius: theme.spacing(2),
        };
      case 'menu':
        return {
          minHeight: '32px',
        };
      default:
        return {};
    }
  };

  return {
    [`&.${tabsClasses.root}`]: {
      [`& .${tabsClasses.indicator}`]: {
        display: $type === 'primary' ? 'block' : 'none',
        height: '1px',
        borderRadius: '1px',
        backgroundColor: theme.palette.border.element,
      },
      [`& .${tabsClasses.flexContainerVertical}`]: {
        alignItems: 'flex-start',
        [`& .${tabClasses.root}`]: {
          marginBottom: theme.spacing(0.5),
          '&:last-child': { marginBottom: 0 },
        },
      },
      [`& .${tabsClasses.vertical}`]: {
        alignItems: 'flex-start',
      },
    },
    ...getTabsVariants($type),
  };
});
