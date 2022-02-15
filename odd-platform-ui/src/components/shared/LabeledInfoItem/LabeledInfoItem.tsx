import React from 'react';
import { Grid, GridSize, TypographyProps } from '@mui/material';
import { DataQualityTestRunStatus } from 'generated-sources';
import * as S from './LabeledInfoItemStyles';

interface LabeledInfoItemProps {
  inline?: boolean;
  label: string | React.ReactNode;
  variant?: TypographyProps['variant'];
  labelWidth?: GridSize;
  runStatus?: DataQualityTestRunStatus;
  valueColor?: string;
  valueLineHeight?: number;
  valueWrap?: boolean;
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
}) => {
  const getXS = () => {
    if (labelWidth === 12) return 12;
    if (typeof labelWidth === 'number')
      return (12 - labelWidth) as GridSize;
    return 'auto';
  };
  return (
    <S.Container container $inline={inline}>
      <S.LabelContainer item xs={labelWidth || 'auto'}>
        <S.Label
          title={typeof label === 'string' ? label : ''}
          variant={variant}
          noWrap
          component="span"
        >
          {label}
        </S.Label>
      </S.LabelContainer>

      <Grid item xs={getXS()} sx={{ width: '100%' }}>
        <S.Value
          $runStatus={runStatus}
          $valueColor={valueColor}
          $inline={inline}
          $valueLineHeight={valueLineHeight}
          variant={variant}
          component="span"
          noWrap={!valueWrap}
          title={children?.toString()}
        >
          {children}
        </S.Value>
      </Grid>
    </S.Container>
  );
};

export default LabeledInfoItem;
