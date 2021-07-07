import React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

const SearchIcon: React.FC<SvgIconProps> = props => (
  <SvgIcon viewBox="0 0 16 16" {...props}>
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="6" cy="6" r="4" stroke="#42526E" strokeWidth="2" />
      <path
        d="M9.57153 9.57141L13.0001 13"
        stroke="#42526E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </SvgIcon>
);

export default SearchIcon;
