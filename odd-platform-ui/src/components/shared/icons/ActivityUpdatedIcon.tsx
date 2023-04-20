import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const ActivityUpdatedIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 16 16' {...props}>
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle cx='8' cy='8' r='8' fill='#E6F2FF' />
      <path
        d='M7.60136 4.24778C8.62763 3.9852 9.7715 4.11508 10.7826 4.69884C12.7788 5.85136 13.5017 8.3366 12.3971 10.2498C11.2925 12.1629 8.77884 12.7796 6.78262 11.627C5.7715 11.0433 5.08709 10.1176 4.80136 9.09753C4.66824 8.6223 4.62166 8.12658 4.66889 7.63541'
        stroke='#0080FF'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M2.60285 9.21387L4.10285 6.61579L6.70093 8.11579'
        stroke='#0080FF'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  </AppSvgIcon>
);

export default ActivityUpdatedIcon;
