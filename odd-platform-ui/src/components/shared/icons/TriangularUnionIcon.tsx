import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const TriangularUnionIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M10.1671 3.74731C10.3788 3.3802 10.5 2.95425 10.5 2.5C10.5 1.11929 9.38071 0 8 0C6.61929 0 5.5 1.11929 5.5 2.5C5.5 2.95425 5.62115 3.3802 5.8329 3.74731L2.78272 9.01581C2.68992 9.00536 2.59559 9 2.5 9C1.11929 9 0 10.1193 0 11.5C0 12.8807 1.11929 14 2.5 14C3.52516 14 4.4062 13.383 4.79198 12.5H11.208C11.5938 13.383 12.4748 14 13.5 14C14.8807 14 16 12.8807 16 11.5C16 10.1193 14.8807 9 13.5 9C13.4044 9 13.3101 9.00536 13.2173 9.01581L10.1671 3.74731ZM11.4865 10.0179L8.54664 4.94006C8.3707 4.9793 8.18777 5 8 5C7.81223 5 7.6293 4.9793 7.45336 4.94006L4.51353 10.0179C4.62333 10.1669 4.71701 10.3284 4.79198 10.5H11.208C11.283 10.3284 11.3767 10.1669 11.4865 10.0179Z'
      fill='#0066CC'
    />
  </AppSvgIcon>
);

export default TriangularUnionIcon;
