import { Grid, LinearProgress, linearProgressClasses, Theme } from '@mui/material';
import styled, { CSSObject } from 'styled-components';
import { DataQualityTestSeverity, SLAColour } from 'generated-sources';

export const Container = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'stretch',
  alignItems: 'stretch',
  justifySelf: 'stretch',
  flexGrow: 1,
}));

export const BarContainer = styled(Grid)(
  () =>
    ({
      flexWrap: 'nowrap',
      marginTop: '3px',
      columnGap: '2px',
    } as CSSObject),
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

const hintListStyles = (theme: Theme) => ({
  margin: 0,
  padding: 0,
  paddingLeft: theme.spacing(2),
  fontSize: theme.typography.body1.fontSize,
  fontWeight: theme.typography.body1.fontWeight,
  lineHeight: theme.typography.body1.lineHeight,
  color: theme.palette.text.primary,
});

export const HintUList = styled('ul')(({ theme }) => hintListStyles(theme));

export const HintOList = styled('ol')(({ theme }) => hintListStyles(theme));
