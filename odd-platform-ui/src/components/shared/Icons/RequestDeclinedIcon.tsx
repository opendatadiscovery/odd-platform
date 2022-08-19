import React from 'react';
import { SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/Icons/AppSvgIcon';

const RequestDeclinedIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon
    width="80px"
    height="80px"
    viewBox="0 0 80 80"
    sx={sx}
    {...props}
  >
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="40" cy="40" r="20" fill="#FFCCCC" />
      <path
        d="M33 33L47 47"
        stroke="#091E42"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M47 33L33 47"
        stroke="#091E42"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </AppSvgIcon>
);

export default RequestDeclinedIcon;
