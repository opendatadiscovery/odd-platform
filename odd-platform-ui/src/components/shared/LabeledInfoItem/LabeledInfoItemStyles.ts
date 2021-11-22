import { Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { propsChecker } from 'lib/helpers';
import { DataQualityTestRunStatusEnum } from 'generated-sources';

export const Container = styled(Grid, {
  shouldForwardProp: propsChecker,
})<{
  $inline?: boolean;
}>(({ theme, $inline }) => {
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
})<{
  $runStatus?: DataQualityTestRunStatusEnum;
  $valueColor?: string;
}>(({ theme, $runStatus, $valueColor }) => ({
  wordBreak: 'break-all',
  overflow: 'hidden',
  color: $runStatus ? theme.palette.runStatus[$runStatus] : $valueColor,
}));
