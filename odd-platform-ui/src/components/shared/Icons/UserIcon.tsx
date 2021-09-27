import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

const UserIcon: React.FC<SvgIconProps> = props => (
  <SvgIcon viewBox="0 0 17 16" {...props}>
    <circle
      cx="8.6665"
      cy="6"
      r="2"
      stroke="#0066CC"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M13.6665 13C12.4742 11.778 10.6769 11 8.6665 11C6.65607 11 4.85881 11.778 3.6665 13"
      stroke="#0066CC"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </SvgIcon>
);

export default UserIcon;
