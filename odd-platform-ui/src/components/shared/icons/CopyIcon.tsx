import React from 'react';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';
import { type SvgIconProps } from '@mui/material/SvgIcon';

const CopyIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M3.99414 2C3.44186 2 2.99414 2.44772 2.99414 3V11C2.99414 11.5523 3.44186 12 3.99414 12H4.49414V13C4.49414 13.8284 5.16571 14.5 5.99414 14.5H11.9941C12.8226 14.5 13.4941 13.8284 13.4941 13V5C13.4941 4.17157 12.8226 3.5 11.9941 3.5H10.9941V3C10.9941 2.44772 10.5464 2 9.99414 2H3.99414ZM10.9941 4.5V11C10.9941 11.5523 10.5464 12 9.99414 12H5.49414V13C5.49414 13.2761 5.718 13.5 5.99414 13.5H11.9941C12.2703 13.5 12.4941 13.2761 12.4941 13V5C12.4941 4.72386 12.2703 4.5 11.9941 4.5H10.9941Z'
      fill='#0066CC'
    />
  </AppSvgIcon>
);

export default CopyIcon;
