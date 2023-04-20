import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const UpstreamArrow: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 8 8' {...props}>
    <svg fill='none' xmlns='http://www.w3.org/2000/svg' x={0} y={1}>
      <path
        d='M5.2 1L1 1M1 1L1 5.2M1 1L7 7'
        stroke='#A8B0BD'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  </AppSvgIcon>
);

export default UpstreamArrow;
