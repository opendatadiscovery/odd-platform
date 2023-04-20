import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const ActivityCreatedIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle cx='8' cy='8' r='8' fill='#E8FCEF' />
      <path
        d='M12.2629 6.26291L7.01915 11.5067L3.4911 7.97862'
        stroke='#27AE60'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  </AppSvgIcon>
);

export default ActivityCreatedIcon;
