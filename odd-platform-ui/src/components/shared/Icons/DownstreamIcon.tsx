import React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

const DownstreamIcon: React.FC<SvgIconProps> = props => (
  <SvgIcon viewBox="0 0 16 16" {...props}>
    <path
      d="M10 3L3 3M3 3L3 10M3 3L13 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);

export default DownstreamIcon;
