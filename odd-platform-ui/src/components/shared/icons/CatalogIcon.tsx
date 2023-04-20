import React from 'react';
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';

const CatalogIcon: React.FC<SvgIconProps> = props => (
  <SvgIcon viewBox='0 0 16 16' {...props} style={{ color: 'transparent' }}>
    <path
      d='M3 4C3 2.89543 3.89543 2 5 2H13V10.5714H3V4Z'
      fill='#091E42'
      stroke='#091E42'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M3 12.2857C3 12.2857 3 10.5714 4.61538 10.5714H3V12.2857Z'
      stroke='#091E42'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M13 10.5714H4.71429C3.76751 10.5714 3 11.3389 3 12.2857V12.2857C3 13.2325 3.76751 14 4.71429 14H13'
      stroke='#091E42'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </SvgIcon>
);

export default CatalogIcon;
