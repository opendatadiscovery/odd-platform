import { Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { propsChecker } from 'lib/helpers';
import { DataQualityTestRunStatus } from 'generated-sources';

interface ValueProps {
  $runStatus?: DataQualityTestRunStatus;
  $valueColor?: string;
  $inline?: boolean;
  component: React.ElementType;
  $valueLineHeight?: number;
}

export const Container = styled(Grid, {
  shouldForwardProp: propsChecker,
})<{
  $inline?: boolean;
}>(({ $inline }) => {
  if ($inline)
    return {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      alignItems: 'center',
    };

  return { alignItems: 'flex-start', flexDirection: 'column' };
});

export const Label = styled(Typography)<{ component: React.ElementType }>(
  ({ theme }) => ({
    display: 'block',
    color: theme.palette.texts.secondary,
    lineHeight: theme.typography.h3.lineHeight,
    overflow: 'hidden',
    width: 'inherit',
  })
);

export const LabelContainer = styled(Grid)(() => ({
  width: '100%',
}));

export const Value = styled(Typography, {
  shouldForwardProp: propsChecker,
})<ValueProps>(
  ({ theme, $runStatus, $valueColor, $inline, $valueLineHeight }) => ({
    wordBreak: 'break-all',
    overflow: 'hidden',
    color: $runStatus ? theme.palette.runStatus[$runStatus] : $valueColor,
    marginLeft: $inline ? theme.spacing(0.5) : '',
    lineHeight: $valueLineHeight ? `${$valueLineHeight}px` : 'inherit',
  })
);
