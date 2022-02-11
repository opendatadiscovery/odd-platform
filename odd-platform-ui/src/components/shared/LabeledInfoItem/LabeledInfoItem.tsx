import React from 'react';
import { Grid, GridSize, TypographyProps } from '@mui/material';
import { DataQualityTestRunStatus } from 'generated-sources';
import * as S from './LabeledInfoItemStyles';

interface LabeledInfoItemProps {
  inline: boolean;
  label: string;
  variant: TypographyProps['variant'];
  labelWidth: GridSize;
  runStatus: DataQualityTestRunStatus;
  valueColor: string;
  valueLineHeight: number;
  valueWrap: boolean;
  borderTop: boolean;
}

const LabeledInfoItem: React.FC<Partial<LabeledInfoItemProps>> = ({
  inline,
  label,
  variant = 'body1',
  children,
  labelWidth,
  runStatus,
  valueColor,
  valueLineHeight,
  valueWrap = false,
  borderTop = false,
}) => (
  <S.Container container $inline={inline} $borderTop={borderTop}>
    <Grid item xs={labelWidth || 'auto'}>
      <S.Label title={label} variant={variant} noWrap component="span">
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
      style={{ width: '100%' }}
    >
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

export default LabeledInfoItem;
