import type { ReactElement } from 'react';
import React, { type FC } from 'react';
import type { GridSize } from '@mui/material';
import type { SxProps } from '@mui/system';
import { Grid } from '@mui/material';

interface InfoItemProps {
  label: ReactElement;
  labelWidth?: GridSize;
  info: ReactElement;
  sx?: SxProps;
}

const InfoItem: FC<InfoItemProps> = ({ labelWidth, label, sx, info }) => {
  const getXS = () => {
    if (labelWidth === 12) return 12;
    if (typeof labelWidth === 'number') return (12 - labelWidth) as GridSize;
    return 'auto';
  };

  return (
    <Grid container sx={sx}>
      <Grid item xs={labelWidth ?? 'auto'}>
        {label}
      </Grid>

      <Grid item xs={getXS()}>
        {info}
      </Grid>
    </Grid>
  );
};

export default InfoItem;
