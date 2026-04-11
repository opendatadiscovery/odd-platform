import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const FolderIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} viewBox='0 0 24 24' {...props}>
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M18.5603 7.03837C18.5041 6.53192 18.076 6.14876 17.5665 6.14876H9.1657C8.74336 6.14876 8.36655 5.88343 8.22421 5.4858L7.92964 4.66296C7.78729 4.26533 7.41049 4 6.98815 4H4.10077C3.51066 4 3.04888 4.50832 3.10536 5.09571L4.45151 19.0957C4.50082 19.6086 4.93171 20 5.44692 20H18.8828C19.4788 20 19.9425 19.482 19.8767 18.8896L18.5603 7.03837Z'
        fill='#C1C7D0'
      />
      <path
        d='M6.49591 9.19622C6.56439 8.70165 6.98718 8.33337 7.48646 8.33337H20.852C21.4588 8.33337 21.9258 8.86945 21.8425 9.47053L20.5041 19.1372C20.4356 19.6318 20.0128 20 19.5135 20H6.148C5.54119 20 5.07423 19.464 5.15745 18.8629L6.49591 9.19622Z'
        fill='#A8B0BD'
      />
    </svg>
  </AppSvgIcon>
);

export default FolderIcon;
