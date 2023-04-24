import React from 'react';
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';

const FeedbackIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <SvgIcon sx={sx} viewBox='0 0 24 24' {...props}>
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M2 7C2 4.79086 3.79086 3 6 3H16.9595C19.1634 3 20.952 4.78265 20.9595 6.98651L20.9865 14.9865C20.9939 17.2009 19.2009 19 16.9865 19H11L7.70711 22.2929C7.07714 22.9229 6 22.4767 6 21.5858L6 19C3.79086 19 2 17.2091 2 15V7ZM8 12C8.55229 12 9 11.5523 9 11C9 10.4477 8.55229 10 8 10C7.44771 10 7 10.4477 7 11C7 11.5523 7.44771 12 8 12ZM12 12C12.5523 12 13 11.5523 13 11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11C11 11.5523 11.4477 12 12 12ZM17 11C17 11.5523 16.5523 12 16 12C15.4477 12 15 11.5523 15 11C15 10.4477 15.4477 10 16 10C16.5523 10 17 10.4477 17 11Z'
        fill='#0080FF'
      />
    </svg>
  </SvgIcon>
);

export default FeedbackIcon;
