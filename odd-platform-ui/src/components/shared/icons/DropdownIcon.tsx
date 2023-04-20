import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const DropdownIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props} transform={props.transform}>
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M4 6L8 10L12 6' stroke='currentColor' />
    </svg>
  </AppSvgIcon>
);

export default DropdownIcon;
