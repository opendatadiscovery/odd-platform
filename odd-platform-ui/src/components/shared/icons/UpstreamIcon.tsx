import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const UpstreamIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M3.70711 2.29289C3.31658 1.90237 2.68342 1.90237 2.29289 2.29289C1.90237 2.68342 1.90237 3.31658 2.29289 3.70711L10.5858 12L6 12C5.44772 12 5 12.4477 5 13C5 13.5523 5.44772 14 6 14L12.9979 14C13.0038 14 13.0096 14 13.0155 13.9999C13.1446 13.9979 13.2678 13.9715 13.3806 13.925C13.4993 13.8762 13.6106 13.8036 13.7071 13.7071C13.9016 13.5126 13.9992 13.2579 14 13.003C14 13.002 14 13.001 14 13V12.9993L14 6C14 5.44772 13.5523 5 13 5C12.4477 5 12 5.44772 12 6L12 10.5858L3.70711 2.29289Z'
    />
  </AppSvgIcon>
);

export default UpstreamIcon;
