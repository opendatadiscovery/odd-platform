import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const UserSyncIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon
    width='78'
    height='41'
    viewBox='0 0 78 41'
    sx={sx}
    {...props}
    style={{ color: 'transparent' }}
  >
    <circle
      cx='46.9141'
      cy='19.1215'
      r='4'
      fill='#0080FF'
      stroke='#0080FF'
      strokeWidth='2'
    />
    <path
      d='M39.7221 36.4199C36.7755 35.7762 36.2026 32.4474 38.705 30.7638C40.9421 29.2588 43.7997 28.1215 46.9133 28.1215C50.027 28.1215 52.8847 29.2589 55.1218 30.764C57.6243 32.4477 57.0512 35.7764 54.1046 36.42C49.8227 37.3553 44.0039 37.3553 39.7221 36.4199Z'
      fill='#0080FF'
      stroke='#0080FF'
      strokeWidth='2'
    />
    <circle cx='28.127' cy='9.12146' r='4' fill='#99CCFF' />
    <path
      d='M20.936 26.4199C17.9894 25.7762 17.4164 22.4474 19.9189 20.7638C22.156 19.2588 25.0136 18.1215 28.1271 18.1215C31.2408 18.1215 34.0986 19.2589 36.3357 20.764C38.8381 22.4477 38.2651 25.7764 35.3185 26.42C31.0366 27.3553 25.2178 27.3553 20.936 26.4199Z'
      fill='#99CCFF'
    />
    <path
      d='M29.8416 35.1215C-0.242034 41.5239 -5.54448 21.2047 16.3658 12.2353M11.1089 10.6727L16.3126 12.2192L14.7662 17.4228'
      stroke='#091E42'
    />
    <path
      d='M40.8411 7.62146C79.8411 -1.37856 83.9772 19.152 62.3177 28.7111M67.6149 30.1308L62.3713 28.7258L63.7764 23.4822'
      stroke='#091E42'
    />
  </AppSvgIcon>
);

export default UserSyncIcon;
