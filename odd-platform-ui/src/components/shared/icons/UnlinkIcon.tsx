import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const UnlinkIcon: React.FC<SvgIconProps> = ({ sx, stroke, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' stroke={stroke ?? '#091E42'} {...props}>
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g id='Group'>
        <g id='Group_2'>
          <path
            id='Path'
            d='M11.3026 8.47087L13.1879 6.58554C14.2292 5.5442 14.2292 3.85554 13.1879 2.8142V2.8142C12.1466 1.77287 10.4579 1.77287 9.41658 2.8142L7.53125 4.69954'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            id='Path_2'
            d='M4.69758 7.5293L2.81225 9.41463C1.77092 10.456 1.77092 12.1446 2.81225 13.186V13.186C3.85358 14.2273 5.54225 14.2273 6.58358 13.186L8.46892 11.3006'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            id='Path_3'
            d='M3.75708 5.64089L2.34375 5.17422'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            id='Path_4'
            d='M5.63698 3.75904L5.17031 2.3457'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            id='Path_5'
            d='M12.2422 10.3598L13.6622 10.8264'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            id='Path_6'
            d='M10.3578 12.2402L10.8245 13.6602'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            id='Path_7'
            d='M6.11719 9.88661L9.89052 6.11328'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </g>
      </g>
    </svg>
  </AppSvgIcon>
);

export default UnlinkIcon;
