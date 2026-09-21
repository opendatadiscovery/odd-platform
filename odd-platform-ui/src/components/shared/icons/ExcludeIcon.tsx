import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

/** The "not" sign — a circle with a diagonal bar; currentColor so it inherits the button's colour (ST-11 / #1845). */
const ExcludeIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
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
        d='M8 3C5.23858 3 3 5.23858 3 8C3 9.0192 3.30494 9.96714 3.82834 10.7574L10.7574 3.82834C9.96714 3.30494 9.0192 3 8 3ZM12.1717 5.24264L5.24264 12.1717C6.03286 12.6951 6.9808 13 8 13C10.7614 13 13 10.7614 13 8C13 6.9808 12.6951 6.03286 12.1717 5.24264ZM1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8Z'
        fill='currentColor'
      />
    </svg>
  </AppSvgIcon>
);

export default ExcludeIcon;
