import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const TargetIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M7 2C7 1.44772 7.44772 1 8 1C8.55228 1 9 1.44772 9 2V3.10002C10.9591 3.4977 12.5023 5.04087 12.9 7H14C14.5523 7 15 7.44772 15 8C15 8.55228 14.5523 9 14 9H12.9C12.5023 10.9591 10.9591 12.5023 9 12.9V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V12.9C5.04087 12.5023 3.4977 10.9591 3.10002 9H2C1.44772 9 1 8.55228 1 8C1 7.44772 1.44772 7 2 7H3.10002C3.4977 5.04087 5.04087 3.4977 7 3.10002V2ZM11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11C9.65685 11 11 9.65685 11 8Z'
      fill='#0066CC'
    />
    <circle cx='8' cy='8' r='1' fill='#0066CC' />
  </AppSvgIcon>
);

export default TargetIcon;
