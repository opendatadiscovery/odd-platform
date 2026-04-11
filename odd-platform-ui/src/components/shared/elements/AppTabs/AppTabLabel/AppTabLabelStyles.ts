import { Typography } from '@mui/material';
import { type Theme } from '@mui/material/styles';
import { type ElementType } from 'react';
import styled, { type CSSObject } from 'styled-components';
import { type HintType } from 'components/shared/elements/AppTabs/interfaces';

const getTabHintStylesByType = (theme: Theme, hintType: HintType): CSSObject => {
  switch (hintType) {
    case 'primary':
      return {
        backgroundColor: theme.palette.backgrounds.primary,
        borderRadius: theme.spacing(0.5),
        color: theme.palette.texts.secondary,
        height: theme.spacing(2),
        fontSize: theme.typography.h6.fontSize,
        lineHeight: theme.typography.h6.lineHeight,
        fontWeight: theme.typography.h6.fontWeight,
        '& > span': { minWidth: '28px' },
      };
    case 'secondary': {
      return {
        backgroundColor: theme.palette.backgrounds.element,
        borderRadius: theme.spacing(0.5),
        color: theme.palette.common.white,
        height: theme.spacing(2),
        fontSize: theme.typography.h6.fontSize,
        lineHeight: theme.typography.h6.lineHeight,
        fontWeight: theme.typography.h6.fontWeight,
        '& > span': { minWidth: '28px' },
      };
    }
    case 'alert':
      return {
        backgroundColor: theme.palette.warning.main,
        borderRadius: '13px',
        width: '23px',
        height: '23px',
        color: theme.palette.common.white,
        fontSize: theme.typography.body2.fontSize,
        lineHeight: '12px',
        fontWeight: 700,
      };
    default:
      return {};
  }
};

export const Container = styled(Typography)<{
  component: ElementType;
}>(() => ({ display: 'flex', alignItems: 'center' }));

export const HintContainer = styled('div')<{ $hintType: HintType }>(
  ({ theme, $hintType }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing(0.5),
    padding: theme.spacing(0.5),
    ...getTabHintStylesByType(theme, $hintType),
  })
);
