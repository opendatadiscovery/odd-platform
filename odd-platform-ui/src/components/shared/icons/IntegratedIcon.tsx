import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const IntegratedIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g clipPath='url(#clip0_7533_14446)'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M8.00016 13.667C4.87055 13.667 2.3335 11.1299 2.3335 8.00033C2.3335 4.87071 4.87055 2.33366 8.00016 2.33366C11.1298 2.33366 13.6668 4.87071 13.6668 8.00033C13.6668 11.1299 11.1298 13.667 8.00016 13.667ZM0.333496 8.00033C0.333496 12.2345 3.76598 15.667 8.00016 15.667C12.2343 15.667 15.6668 12.2345 15.6668 8.00033C15.6668 3.76614 12.2343 0.333658 8.00016 0.333658C3.76598 0.333658 0.333496 3.76614 0.333496 8.00033ZM4.62639 8.70743L7.29306 11.3741C7.68358 11.7646 8.31675 11.7646 8.70727 11.3741L11.3739 8.70743C11.7645 8.31691 11.7645 7.68374 11.3739 7.29322C10.9834 6.90269 10.3502 6.90269 9.95972 7.29322L9.00016 8.25278V5.33366C9.00016 4.78137 8.55245 4.33366 8.00016 4.33366C7.44788 4.33366 7.00016 4.78137 7.00016 5.33366V8.25278L6.0406 7.29322C5.65008 6.90269 5.01691 6.90269 4.62639 7.29322C4.23587 7.68374 4.23587 8.31691 4.62639 8.70743Z'
          fill='#1FAD1F'
        />
      </g>
      <defs>
        <clipPath id='clip0_7533_14446'>
          <rect width='16' height='16' fill='white' transform='matrix(1 0 0 -1 0 16)' />
        </clipPath>
      </defs>
    </svg>
  </AppSvgIcon>
);

export default IntegratedIcon;
