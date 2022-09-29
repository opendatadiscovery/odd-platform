import React from 'react';
import { SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/Icons/AppSvgIcon';

const GraphIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle cx='12' cy='5' r='1' fill='#7A869A' />
      <circle cx='10' cy='11' r='1' fill='#7A869A' />
      <circle cx='11' cy='8' r='1' fill='#7A869A' />
      <circle cx='3' cy='8' r='1' fill='#7A869A' />
      <path
        d='M12 5H7L5.5 8M10 11H7L5.5 8M5.5 8H11M5.5 8H3'
        stroke='#7A869A'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  </AppSvgIcon>
);

export default GraphIcon;
