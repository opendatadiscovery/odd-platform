import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const KebabIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <path
      d='M9.5 12.5C9.5 13.3285 8.82843 14 8 14C7.17157 14 6.5 13.3285 6.5 12.5C6.5 11.6716 7.17157 11 8 11C8.82843 11 9.5 11.6716 9.5 12.5Z'
      fill='#0066CC'
    />
    <path
      d='M9.5 8.00002C9.5 8.82845 8.82843 9.50002 8 9.50002C7.17157 9.50002 6.5 8.82845 6.5 8.00002C6.5 7.1716 7.17157 6.50002 8 6.50002C8.82843 6.50002 9.5 7.1716 9.5 8.00002Z'
      fill='#0066CC'
    />
    <path
      d='M9.5 3.5C9.5 4.32843 8.82843 5 8 5C7.17157 5 6.5 4.32843 6.5 3.5C6.5 2.67157 7.17157 2 8 2C8.82843 2 9.5 2.67157 9.5 3.5Z'
      fill='#0066CC'
    />
  </AppSvgIcon>
);

export default KebabIcon;
