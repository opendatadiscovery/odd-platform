import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const ChevronIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} width={10} height={5} viewBox='0 0 10 5' {...props}>
    <svg
      width='10'
      height='5'
      viewBox='0 0 10 5'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M5.70707 4.35356C5.31654 4.74409 4.68338 4.74409 4.29285 4.35356L0.999962 1.06067C0.804699 0.865405 0.8047 0.548823 0.999962 0.353561C1.19522 0.158299 1.51181 0.158298 1.70707 0.35356L4.99996 3.64646L8.29286 0.353563C8.48812 0.158301 8.8047 0.158301 8.99996 0.353563C9.19522 0.548825 9.19523 0.865407 8.99996 1.06067L5.70707 4.35356Z'
        fill='currentColor'
      />
    </svg>
  </AppSvgIcon>
);

export default ChevronIcon;
