import { Grid, Typography } from '@mui/material';
import styled from 'styled-components';
import { DataQualityTestRunStatus } from 'generated-sources';
import { ElementType } from 'react';

interface ValueProps {
  $runStatus?: DataQualityTestRunStatus;
  $valueColor?: string;
  $inline?: boolean;
  component: ElementType;
  $valueLineHeight?: number;
}

export const Container = styled(Grid)<{
  $inline?: boolean;
}>(({ $inline }) => {
  if ($inline)
    return {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      alignItems: 'center',
    };

  return {
    alignItems: 'flex-start',
    flexDirection: 'column',
  };
});

export const Label = styled(Typography)<{ component: ElementType }>(
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

export const ValueContainer = styled(Grid)(() => ({
  width: '100%',
  overflow: 'hidden',
}));

export const Value = styled(Typography)<ValueProps>(
  ({ theme, $runStatus, $valueColor, $inline, $valueLineHeight }) => ({
    wordBreak: 'break-all',
    overflow: 'hidden',
    color: $runStatus ? theme.palette.runStatus[$runStatus] : $valueColor,
    marginLeft: $inline ? theme.spacing(0.5) : '',
    lineHeight: $valueLineHeight ? `${$valueLineHeight}px` : 'inherit',
  })
);
