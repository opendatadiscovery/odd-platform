import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const ActivityDeletedIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle cx='8' cy='8' r='8' fill='#FFE6E6' />
      <path d='M11 5L5 11' stroke='#F2330D' strokeWidth='2' strokeLinecap='round' />
      <path d='M11 11L5 5' stroke='#F2330D' strokeWidth='2' strokeLinecap='round' />
    </svg>
  </AppSvgIcon>
);

export default ActivityDeletedIcon;
