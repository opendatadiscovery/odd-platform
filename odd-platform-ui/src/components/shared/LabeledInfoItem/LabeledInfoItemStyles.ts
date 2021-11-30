import { Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { propsChecker } from 'lib/helpers';
import { DataQualityTestRunStatusEnum } from 'generated-sources';

interface ValueProps {
  $runStatus?: DataQualityTestRunStatusEnum;
  $valueColor?: string;
  $inline?: boolean;
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

export const Label = styled(Typography)(({ theme }) => ({
  color: theme.palette.texts.secondary,
  lineHeight: theme.typography.h3.lineHeight,
  overflow: 'hidden',
}));

export const Value = styled(Typography, {
  shouldForwardProp: propsChecker,
})<ValueProps>(({ theme, $runStatus, $valueColor, $inline }) => ({
  wordBreak: 'break-all',
  overflow: 'hidden',
  color: $runStatus ? theme.palette.runStatus[$runStatus] : $valueColor,
  marginLeft: $inline ? theme.spacing(0.5) : '',
}));
