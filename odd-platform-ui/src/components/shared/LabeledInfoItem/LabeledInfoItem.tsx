import React, { ElementType } from 'react';
import { Grid, GridSize, TypographyProps } from '@mui/material';
import { DataQualityTestRunStatus } from 'generated-sources';
import {
  Container,
  ValueContainer,
  Label,
  Value,
} from './LabeledInfoItemStyles';

interface LabeledInfoItemProps {
  inline?: boolean;
  label: string;
  variant?: TypographyProps['variant'];
  labelWidth?: GridSize;
  runStatus?: DataQualityTestRunStatus;
  valueColor?: string;
  valueLineHeight?: number;
  valueWrap?: boolean;
  valueComponent?: ElementType;
}

const LabeledInfoItem: React.FC<LabeledInfoItemProps> = ({
  inline,
  label,
  variant = 'body1',
  children,
  labelWidth,
  runStatus,
  valueColor,
  valueLineHeight,
  valueWrap = false,
  valueComponent = 'span',
}) => (
  <Container container $inline={inline}>
    <Grid item xs={labelWidth || 'auto'}>
      <Label title={label} variant={variant} noWrap component="span">
        {label}
      </Label>
    </Grid>
    <ValueContainer
      item
      xs={
        typeof labelWidth === 'number'
          ? ((12 - labelWidth) as GridSize)
          : 'auto'
      }
    >
      <Value
        $runStatus={runStatus}
        $valueColor={valueColor}
        $inline={inline}
        $valueLineHeight={valueLineHeight}
        variant={variant}
        component={valueComponent}
        noWrap={!valueWrap}
        title={
          typeof children === 'string' ? children?.toString() : undefined
        }
      >
        {children}
      </Value>
    </ValueContainer>
  </Container>
);

export default LabeledInfoItem;
