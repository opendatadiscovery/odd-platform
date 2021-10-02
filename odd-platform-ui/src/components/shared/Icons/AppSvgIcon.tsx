import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { styled } from '@mui/material/styles';

const AppSvgIcon = styled(SvgIcon)<SvgIconProps>(({ theme }) => ({
  width: '16px',
  height: '16px',
}));

export default AppSvgIcon;
