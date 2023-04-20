import React from 'react';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';
import { type SvgIconProps } from '@mui/material/SvgIcon';

const RejectIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M10.2929 11.7071C10.6834 12.0976 11.3166 12.0976 11.7071 11.7071C12.0976 11.3166 12.0976 10.6834 11.7071 10.2929L9.41421 8L11.7071 5.70711C12.0976 5.31658 12.0976 4.68342 11.7071 4.29289C11.3166 3.90237 10.6834 3.90237 10.2929 4.29289L8 6.58579L5.70711 4.29289C5.31658 3.90237 4.68342 3.90237 4.29289 4.29289C3.90237 4.68342 3.90237 5.31658 4.29289 5.70711L6.58579 8L4.29289 10.2929C3.90237 10.6834 3.90237 11.3166 4.29289 11.7071C4.68342 12.0976 5.31658 12.0976 5.70711 11.7071L8 9.41421L10.2929 11.7071Z'
        fill='currentColor'
      />
    </svg>
  </AppSvgIcon>
);

export default RejectIcon;
