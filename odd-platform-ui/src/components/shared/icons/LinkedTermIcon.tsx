import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const LinkedTermIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M6 8.00002C6 9.65687 7.30244 11 8.90909 11H11.0909C12.6976 11 14 9.65687 14 8.00002C14 7.09653 13.6127 6.28633 13 5.73633'
        stroke='#7A869A'
        strokeWidth='2'
        strokeLinecap='round'
      />
      <path
        d='M10 8C10 6.34315 8.69756 5 7.09091 5L4.90909 5C3.30244 5 2 6.34315 2 8C2 8.90349 2.38729 9.71369 3 10.2637'
        stroke='#7A869A'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  </AppSvgIcon>
);

export default LinkedTermIcon;
