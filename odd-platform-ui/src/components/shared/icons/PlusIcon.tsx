import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const PlusIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 6 6' {...props}>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M2 5C2 5.55228 2.44772 6 3 6C3.55228 6 4 5.55228 4 5V4H5C5.55228 4 6 3.55228 6 3C6 2.44772 5.55228 2 5 2H4V1C4 0.447715 3.55228 0 3 0C2.44772 0 2 0.447715 2 1V2H1C0.447715 2 0 2.44772 0 3C0 3.55228 0.447715 4 1 4H2V5Z'
      fill='white'
    />
  </AppSvgIcon>
);

export default PlusIcon;
