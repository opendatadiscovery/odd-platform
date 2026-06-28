import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

// Clock glyph — the "Recently viewed" marker (the sibling personal-navigation feature, PLT-250).
// Added here so that feature inherits the icon system rather than re-opening the star collision
// (#1815 / PRD-0002 note 1 + §3 shared-foundation discipline).
const RecentlyViewedIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 24 24' {...props}>
    <path d='M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z' />
  </AppSvgIcon>
);

export default RecentlyViewedIcon;
