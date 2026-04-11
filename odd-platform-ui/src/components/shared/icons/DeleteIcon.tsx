import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const DeleteIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 17 17' {...props}>
    <svg fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M7.49414 2.5C6.94186 2.5 6.49414 2.94772 6.49414 3.5H3.49414V4.5H13.4941V3.5H10.4941C10.4941 2.94772 10.0464 2.5 9.49414 2.5H7.49414ZM12.4941 13.5C12.4941 14.0523 12.0464 14.5 11.4941 14.5H5.49414C4.94186 14.5 4.49414 14.0523 4.49414 13.5V6.5L12.4941 6.5V13.5Z'
        fill='currentColor'
      />
    </svg>
  </AppSvgIcon>
);

export default DeleteIcon;
