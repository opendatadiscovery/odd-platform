import React, { type ElementType } from 'react';
import type { GridSize, TypographyProps } from '@mui/material';
import type { DataEntityRunStatus } from 'generated-sources';
import type { SxProps } from '@mui/system';
import {
  Container,
  Label,
  LabelContainer,
  Value,
  ValueContainer,
} from 'components/shared/elements/LabeledInfoItem/LabeledInfoItemStyles';

interface LabeledInfoItemProps extends React.PropsWithChildren {
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
  sx?: SxProps;
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
  sx,
}) => {
  const getXS = () => {
    if (labelWidth === 12) return 12;
    if (typeof labelWidth === 'number') return (12 - labelWidth) as GridSize;
    return 'auto';
  };

  return (
    <Container container sx={sx} $inline={inline}>
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
