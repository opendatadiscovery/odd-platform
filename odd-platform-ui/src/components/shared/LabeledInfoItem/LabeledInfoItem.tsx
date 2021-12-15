import React from 'react';
import { Grid, GridSize, TypographyProps } from '@mui/material';
import { DataQualityTestRunStatusEnum } from 'generated-sources';
import * as S from './LabeledInfoItemStyles';

interface LabeledInfoItemProps {
  inline?: boolean;
  label: string;
  variant?: TypographyProps['variant'];
  labelWidth?: GridSize;
  runStatus?: DataQualityTestRunStatusEnum;
  valueColor?: string;
}

const LabeledInfoItem: React.FC<LabeledInfoItemProps> = ({
  inline,
  label,
  variant = 'body1',
  children,
  labelWidth,
  runStatus,
  valueColor,
}) => (
  <S.Container container $inline={inline}>
    <Grid item xs={labelWidth || 'auto'}>
      <S.Label variant={variant} noWrap>
        {label}
      </S.Label>
    </Grid>
    <Grid
      item
      xs={
        typeof labelWidth === 'number'
          ? ((12 - labelWidth) as GridSize)
          : 'auto'
      }
    >
      <S.Value
        $runStatus={runStatus}
        $valueColor={valueColor}
        $inline={inline}
        variant={variant}
        noWrap
      >
        {children}
      </S.Value>
    </Grid>
  </S.Container>
);

export default LabeledInfoItem;
