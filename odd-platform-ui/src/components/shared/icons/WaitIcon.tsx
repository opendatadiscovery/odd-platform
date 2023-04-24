import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const WaitIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon width='80px' height='80px' viewBox='0 0 80 80' sx={sx} {...props}>
    <svg
      width='80'
      height='80'
      viewBox='0 0 80 80'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M34.8333 30.6215C73.8332 21.6215 77.9694 42.152 56.3099 51.7111M61.6071 53.1308L56.3635 51.7258L57.7685 46.4822'
        stroke='#091E42'
      />
      <path
        d='M51 65.9411C51 69.4411 26 69.4411 26 65.9411C26 59.0375 31.5964 45.4411 38.5 45.4411C45.4036 45.4411 51 59.0375 51 65.9411Z'
        fill='#0080FF'
      />
      <path
        d='M26 24.4411C26 21.4411 51 20.9411 51 24.4411C51 31.3447 45.4036 44.9411 38.5 44.9411C31.5964 44.9411 26 31.3447 26 24.4411Z'
        fill='#99CCFF'
      />
      <path
        d='M36.9783 58.4977C6.89468 64.9002 1.59224 44.5809 23.5026 35.6116M18.2457 34.049L23.4493 35.5954L21.9029 40.7991'
        stroke='#091E42'
      />
    </svg>
  </AppSvgIcon>
);

export default WaitIcon;
