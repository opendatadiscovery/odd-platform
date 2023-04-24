import React from 'react';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';
import { type SvgIconProps } from '@mui/material/SvgIcon';

const AcceptIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12.9701 5.55559C13.3606 5.94611 13.3606 6.57928 12.9701 6.9698L7.72636 12.2136C7.33584 12.6041 6.70267 12.6041 6.31215 12.2136L2.7841 8.68552C2.39358 8.29499 2.39358 7.66183 2.7841 7.27131C3.17463 6.88078 3.80779 6.88078 4.19832 7.27131L7.01925 10.0922L11.5559 5.55559C11.9464 5.16506 12.5796 5.16506 12.9701 5.55559Z'
        fill='currentColor'
      />
    </svg>
  </AppSvgIcon>
);

export default AcceptIcon;
