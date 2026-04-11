import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const EditIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <svg fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M6.5 12.5858L3.41421 9.5L9.5 3.41421L12.5858 6.5L6.5 12.5858ZM3 13L3 11.9142L4.08578 13L3 13Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='square'
      />
    </svg>
  </AppSvgIcon>
);

export default EditIcon;
