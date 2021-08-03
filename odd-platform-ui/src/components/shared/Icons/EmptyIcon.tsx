import React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

const EmptyIcon: React.FC<SvgIconProps> = props => (
  <SvgIcon viewBox="0 0 16 16" {...props} style={{ color: 'transparent' }}>
    <circle cx="8" cy="8" r="5" stroke="#A8B0BD" strokeWidth="2" />
    <rect
      x="4"
      y="5.41418"
      width="2"
      height="9.37199"
      rx="1"
      transform="rotate(-45 4 5.41418)"
      fill="#A8B0BD"
    />
  </SvgIcon>
);

export default EmptyIcon;
