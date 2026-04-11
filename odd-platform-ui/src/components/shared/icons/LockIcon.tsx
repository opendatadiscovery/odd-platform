import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const LockIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M9 11C9 10.4477 8.55228 10 8 10C7.44772 10 7 10.4477 7 11C7 11.5523 7.44772 12 8 12C8.55228 12 9 11.5523 9 11ZM9 5V7H7V5C7 4.44772 7.44772 4 8 4C8.55228 4 9 4.44772 9 5ZM11 7.17071C12.1652 7.58254 13 8.69378 13 10V12C13 13.6569 11.6569 15 10 15H6C4.34315 15 3 13.6569 3 12V10C3 8.69378 3.83481 7.58254 5 7.17071V5C5 3.34315 6.34315 2 8 2C9.65685 2 11 3.34315 11 5V7.17071Z'
        fill='#7A869A'
      />
    </svg>
  </AppSvgIcon>
);

export default LockIcon;
