import {
  Grid,
  LinearProgress,
  linearProgressClasses,
  type Theme,
  Typography,
} from '@mui/material';
import styled, { type CSSObject } from 'styled-components';
import type { DataQualityTestSeverity, SLAColour } from 'generated-sources';

export const Container = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'stretch',
  alignItems: 'stretch',
  justifySelf: 'stretch',
  flexGrow: 1,
}));

export const TooltipStyles = {
  maxWidth: '420px !important',
  padding: '16px !important',
};

export const BarContainer = styled(Grid)(
  () => ({ flexWrap: 'nowrap', marginTop: '3px', columnGap: '2px' } as CSSObject)
);

export const Bar = styled(LinearProgress)<{
  $slaColor: SLAColour | undefined;
}>(({ theme, $slaColor }) => ({
  [`&.${linearProgressClasses.root}`]: {
    borderRadius: '2px',
    height: '7px',
    backgroundColor: theme.palette.backgrounds.secondary,

    [`& .${linearProgressClasses.bar}`]: {
      backgroundColor: $slaColor ? theme.palette.slaStatus[$slaColor] : '',
      borderRadius: '2px',
    },

    [`& .${linearProgressClasses.determinate}`]: {
      backgroundColor: theme.palette.backgrounds.secondary,
    },
  },
}));

export const WeightsBar = styled('div')<{
  $severity: DataQualityTestSeverity;
  $count: number;
  $total: number;
}>(({ theme, $severity, $count, $total }) => {
  const relation = Math.round((100 * ($count || 0)) / ($total || 1));

  return {
    backgroundColor: theme.palette.slaStatus[$severity],
    height: '2px',
    borderRadius: '1px',
    width: '100%',
    maxWidth: `${relation}%`,
  };
});

export const HintHeader = styled(Typography)(({ theme }) => ({
  color: theme.palette.texts.primary,
  letterSpacing: '0.05px',
}));

export const HintText = styled(Typography)(({ theme }) => ({
  color: theme.palette.texts.secondary,
}));

const hintListStyles = (theme: Theme, isOList?: boolean) => ({
  margin: 0,
  marginTop: isOList ? theme.spacing(1) : 0,
  padding: 0,
  paddingLeft: theme.spacing(2),
  fontSize: theme.typography.body1.fontSize,
  fontWeight: isOList ? 400 : 700,
  lineHeight: theme.typography.body1.lineHeight,
  color: theme.palette.texts.secondary,
  letterSpacing: 0,
});

export const HintUList = styled('ul')(({ theme }) => hintListStyles(theme));

export const HintOList = styled('ol')<{ $isOList?: boolean }>(({ theme, $isOList }) =>
  hintListStyles(theme, $isOList)
);

export const SLARect = styled('span')<{ $color: SLAColour }>(({ theme, $color }) => ({
  display: 'inline-block',
  position: 'relative',
  top: '2px',
  width: '14px',
  height: '14px',
  borderRadius: '2px',
  backgroundColor: theme.palette.slaStatus[$color],
}));
