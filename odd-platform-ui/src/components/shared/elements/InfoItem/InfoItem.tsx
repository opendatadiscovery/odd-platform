import React, { type FC, type ReactElement } from 'react';
import type { SxProps } from '@mui/system';
import { Box } from '@mui/material';

interface InfoItemProps {
  label: ReactElement;
  info: ReactElement;
  sx?: SxProps;
}

const InfoItem: FC<InfoItemProps> = ({ label, sx, info }) => (
  <Box display='flex' flexWrap='wrap' sx={sx} flexShrink={1}>
    <Box display='flex' flexGrow={0.03} alignItems='center'>
      {label}
    </Box>

    <Box display='flex' alignItems='center' flexWrap='wrap'>
      {info}
    </Box>
  </Box>
);

export default InfoItem;
