import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

const DeleteIcon: React.FC<SvgIconProps> = props => (
  <SvgIcon viewBox="0 0 16 16" {...props}>
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2H6V3H4H3V5H4V12V14H6H10H12V12V5H13V3H12H10V2ZM6 5H10V12H6V5Z"
        fill="currentColor"
      />
    </svg>
  </SvgIcon>
);

export default DeleteIcon;
