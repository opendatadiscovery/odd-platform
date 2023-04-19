import { Grid, Typography } from '@mui/material';
import styled from 'styled-components';
import { type DataEntityRunStatus } from 'generated-sources';
import { type ElementType } from 'react';

interface ValueProps {
  $runStatus?: DataEntityRunStatus;
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

export const Label = styled(Typography)<{ component: ElementType }>(({ theme }) => ({
  display: 'block',
  color: theme.palette.texts.secondary,
  lineHeight: theme.typography.h3.lineHeight,
  overflow: 'hidden',
  width: 'inherit',
}));

export const LabelContainer = styled(Grid)(() => ({
  width: '100%',
}));

export const ValueContainer = styled(Grid)(() => ({
  width: '100%',
  overflow: 'inherit',
}));

export const Value = styled(Typography)<ValueProps>(
  ({ theme, $runStatus, $valueColor, $inline, $valueLineHeight }) => ({
    display: 'block',
    wordBreak: 'break-all',
    overflow: 'hidden',
    color: $runStatus ? theme.palette.runStatus[$runStatus].color : $valueColor,
    marginLeft: $inline ? theme.spacing(0.5) : '',
    lineHeight: $valueLineHeight ? `${$valueLineHeight}px` : 'inherit',
  })
);
