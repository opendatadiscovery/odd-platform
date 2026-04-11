import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const DownstreamArrow: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 8 8' {...props}>
    <svg fill='none' xmlns='http://www.w3.org/2000/svg' x={0} y={1}>
      <path
        d='M2.8 7L7 7M7 7L7 2.8M7 7L1 0.999999'
        stroke='#A8B0BD'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  </AppSvgIcon>
);

export default DownstreamArrow;
