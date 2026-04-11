import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const PreviewIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 24 24' {...props}>
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M2.07868 8.31131C1.97402 8.11731 1.97402 7.88198 2.07868 7.68798C3.34002 5.35531 5.67002 3.33331 8.00002 3.33331C10.33 3.33331 12.66 5.35531 13.9213 7.68865C14.026 7.88265 14.026 8.11798 13.9213 8.31198C12.66 10.6446 10.33 12.6666 8.00002 12.6666C5.67002 12.6666 3.34002 10.6446 2.07868 8.31131Z'
        stroke='#091E42'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M9.41422 6.58577C10.1953 7.36681 10.1953 8.63315 9.41422 9.41419C8.63317 10.1952 7.36684 10.1952 6.58579 9.41419C5.80474 8.63315 5.80474 7.36681 6.58579 6.58577C7.36684 5.80472 8.63317 5.80472 9.41422 6.58577Z'
        stroke='#091E42'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  </AppSvgIcon>
);

export default PreviewIcon;
