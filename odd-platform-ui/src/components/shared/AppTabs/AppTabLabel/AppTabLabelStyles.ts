import { Typography } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { HintType } from 'components/shared/AppTabs/interfaces';
import { ElementType } from 'react';
import styled, { CSSObject } from 'styled-components';

const getTabHintStylesByType = (theme: Theme, hintType: HintType): CSSObject => {
  switch (hintType) {
    case 'primary':
      return {
        backgroundColor: theme.palette.backgrounds.primary,
        borderRadius: '4px',
        color: theme.palette.texts.secondary,
        height: '16px',
        fontSize: theme.typography.h6.fontSize,
        lineHeight: theme.typography.h6.lineHeight,
        fontWeight: theme.typography.h6.fontWeight,
        '& > span': { minWidth: '28px' },
      };
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
    ...getTabHintStylesByType(theme, $hintType),
  })
);
