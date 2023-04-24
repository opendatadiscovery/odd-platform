import React from 'react';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';
import { type SvgIconProps } from '@mui/material/SvgIcon';

const CloseIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 14 14' {...props}>
    <svg fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M6.97809 6.2711L1.33162 0.624634L0.624512 1.33174L6.27098 6.97821L0.624516 12.6247L1.33162 13.3318L6.97809 7.68532L12.6245 13.3317L13.3316 12.6246L7.6852 6.97821L13.3316 1.33178L12.6245 0.624675L6.97809 6.2711Z'
        fill='currentColor'
      />
    </svg>
  </AppSvgIcon>
);

export default CloseIcon;
