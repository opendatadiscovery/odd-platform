import React, { ElementType } from 'react';
import { GridSize, TypographyProps } from '@mui/material';
import { DataEntityRunStatus } from 'generated-sources';
import { SxProps } from '@mui/system';
import {
  Container,
  Label,
  LabelContainer,
  Value,
  ValueContainer,
} from './LabeledInfoItemStyles';

interface LabeledInfoItemProps {
  inline?: boolean;
  label: string | React.ReactNode;
  variant?: TypographyProps['variant'];
  labelWidth?: GridSize;
  runStatus?: DataEntityRunStatus;
  valueColor?: string;
  valueLineHeight?: number;
  valueWrap?: boolean;
  valueComponent?: ElementType;
  valueSx?: SxProps;
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
  valueSx,
}) => {
  const getXS = () => {
    if (labelWidth === 12) return 12;
    if (typeof labelWidth === 'number') return (12 - labelWidth) as GridSize;
    return 'auto';
  };

  return (
    <Container container $inline={inline}>
      <LabelContainer item xs={labelWidth || 'auto'}>
        <Label
          title={typeof label === 'string' ? label : ''}
          variant={variant}
          noWrap
          component='span'
        >
          {label}
        </Label>
      </LabelContainer>

      <ValueContainer item xs={getXS()} sx={{ width: '100%' }}>
        <Value
          sx={valueSx}
          $runStatus={runStatus}
          $valueColor={valueColor}
          $inline={inline}
          $valueLineHeight={valueLineHeight}
          variant={variant}
          component={valueComponent}
          noWrap={!valueWrap}
          title={typeof children === 'string' ? children?.toString() : undefined}
        >
          {children}
        </Value>
      </ValueContainer>
    </Container>
  );
};

export default LabeledInfoItem;
