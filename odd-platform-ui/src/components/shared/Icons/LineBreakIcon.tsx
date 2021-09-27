import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

const LineBreakIcon: React.FC<SvgIconProps> = props => (
  <SvgIcon viewBox="0 0 16 16" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.5 5V8.5H11.7929L10.6464 7.35355L11.3536 6.64645L13.3536 8.64645L13.7071 9L13.3536 9.35355L11.3536 11.3536L10.6464 10.6464L11.7929 9.5H3H2.5V9L2.5 5H3.5Z"
      fill="#42526E"
    />
  </SvgIcon>
);

export default LineBreakIcon;
