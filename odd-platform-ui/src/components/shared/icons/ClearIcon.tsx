import React from 'react';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';
import { type SvgIconProps } from '@mui/material/SvgIcon';

const ClearIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <svg fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M7.97822 7.27111L4.70711 4L4 4.70711L7.27111 7.97822L4 11.2493L4.70711 11.9564L7.97822 8.68532L11.2493 11.9564L11.9564 11.2493L8.68532 7.97822L11.9564 4.70713L11.2493 4.00002L7.97822 7.27111Z'
        fill='currentColor'
      />
    </svg>
  </AppSvgIcon>
);

export default ClearIcon;
