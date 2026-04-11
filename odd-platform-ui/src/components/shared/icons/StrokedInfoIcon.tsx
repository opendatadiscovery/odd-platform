import React from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const StrokedInfoIcon: React.FC<SvgIconProps> = React.forwardRef(
  ({ sx, ...props }, ref) => (
    <AppSvgIcon ref={ref} sx={sx} viewBox='0 0 16 16' {...props}>
      <svg
        width='16'
        height='16'
        viewBox='0 0 16 16'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <circle cx='8' cy='8' r='6.5' stroke='#A8B0BD' />
        <path
          d='M8 8L8 11'
          stroke='#A8B0BD'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <circle cx='8' cy='5' r='1' fill='#A8B0BD' />
      </svg>
    </AppSvgIcon>
  )
);

export default StrokedInfoIcon;
