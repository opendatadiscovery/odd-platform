import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from './AppSvgIcon';

const AlertDQTestIcon: React.FC<SvgIconProps> = ({ sx, fill, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 24 24' {...props}>
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
        d='M17.7973 0.324275C17.6078 0.117646 17.3404 0 17.0601 0H2C1.44772 0 1 0.447714 1 0.999999V14.9362C1 15.8908 2.20978 16.3027 2.79224 15.5464L7.60769 9.29447C7.93157 8.87396 8.52756 8.77976 8.96535 9.07988L11.6895 10.9474C12.082 11.2165 12.6098 11.1716 12.9514 10.8402L19.9198 4.07755C20.3082 3.70064 20.3262 3.08315 19.9605 2.6842L17.7973 0.324275ZM22.9027 5.89384C22.7617 5.74006 22.5216 5.73304 22.3719 5.87832L13.2794 14.7023C12.9379 15.0337 12.4101 15.0786 12.0175 14.8095L9.61012 13.1591C9.17233 12.859 8.57634 12.9532 8.25245 13.3737L1.18758 22.5462C1.06596 22.7041 1 22.8978 1 23.0971C1 23.5958 1.40424 24 1.90289 24H22C22.5523 24 23 23.5523 23 23V6.14402C23 6.05139 22.9653 5.96212 22.9027 5.89384Z'
        fill={fill || '#A8B0BD'}
      />
    </svg>
  </AppSvgIcon>
);

export default AlertDQTestIcon;
