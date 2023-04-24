import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const MoreIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 13 4' {...props}>
    <svg
      width='13'
      height='4'
      viewBox='0 0 13 4'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M3 2C3 2.82843 2.32843 3.5 1.5 3.5C0.671573 3.5 0 2.82843 0 2C0 1.17157 0.671573 0.5 1.5 0.5C2.32843 0.5 3 1.17157 3 2ZM8 2C8 2.82843 7.32843 3.5 6.5 3.5C5.67157 3.5 5 2.82843 5 2C5 1.17157 5.67157 0.5 6.5 0.5C7.32843 0.5 8 1.17157 8 2ZM11.5 3.5C12.3284 3.5 13 2.82843 13 2C13 1.17157 12.3284 0.5 11.5 0.5C10.6716 0.5 10 1.17157 10 2C10 2.82843 10.6716 3.5 11.5 3.5Z'
        fill='currentColor'
      />
    </svg>
  </AppSvgIcon>
);

export default MoreIcon;
