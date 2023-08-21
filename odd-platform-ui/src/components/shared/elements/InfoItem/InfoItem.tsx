import React, { type FC, type ReactElement } from 'react';
import type { GridSize } from '@mui/material';
import { Grid } from '@mui/material';
import type { SxProps } from '@mui/system';

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
