import React from 'react';
import { Grid, GridSize, TypographyProps } from '@mui/material';
import { DataQualityTestRunStatusEnum } from 'generated-sources';
import * as S from './LabeledInfoItemStyles';

interface LabeledInfoItemProps {
  inline?: boolean;
  label: string | React.ReactNode;
  variant?: TypographyProps['variant'];
  labelWidth?: GridSize;
  runStatus?: DataQualityTestRunStatusEnum;
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
}) => (
  <S.Container container $inline={inline}>
    <Grid item container xs={labelWidth || 'auto'}>
      <S.Label
        title={typeof label === 'string' ? label : ''}
        variant={variant}
        noWrap
        component="span"
      >
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
      sx={{ width: '100%' }}
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
