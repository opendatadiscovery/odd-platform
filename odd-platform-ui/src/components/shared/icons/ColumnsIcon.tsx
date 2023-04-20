import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const ColumnsIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M4 14C3.44772 14 3 13.5523 3 13L3 3C3 2.44771 3.44772 2 4 2C4.55228 2 5 2.44772 5 3L5 13C5 13.5523 4.55228 14 4 14ZM8 14C7.44772 14 7 13.5523 7 13L7 3C7 2.44771 7.44772 2 8 2C8.55228 2 9 2.44772 9 3L9 13C9 13.5523 8.55228 14 8 14ZM11 13C11 13.5523 11.4477 14 12 14C12.5523 14 13 13.5523 13 13L13 3C13 2.44772 12.5523 2 12 2C11.4477 2 11 2.44771 11 3L11 13Z'
      fill={props.fill || '#0066CC'}
    />
  </AppSvgIcon>
);

export default ColumnsIcon;
