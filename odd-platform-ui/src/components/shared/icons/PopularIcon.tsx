import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

// Trending-up glyph — the "Popular" (most-used) marker. Distinct from the star, which now means
// "Favorite" everywhere (#1815 / PRD-0002 note 1: the global icon system).
const PopularIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 24 24' {...props}>
    <path d='M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z' />
  </AppSvgIcon>
);

export default PopularIcon;
