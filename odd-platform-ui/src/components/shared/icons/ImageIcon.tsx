import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';

const ImageIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => (
  <AppSvgIcon sx={sx} width={25} height={24} viewBox='0 0 25 24' {...props}>
    <svg
      width='25'
      height='24'
      viewBox='0 0 25 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M5.5 4C4.94772 4 4.5 4.44772 4.5 5V19C4.5 19.4288 4.7699 19.7946 5.14909 19.9367L15.7929 9.29289C16.1834 8.90237 16.8166 8.90237 17.2071 9.29289L20.5 12.5858V5C20.5 4.44771 20.0523 4 19.5 4H5.5ZM22.5 5C22.5 3.34315 21.1569 2 19.5 2H5.5C3.84315 2 2.5 3.34315 2.5 5V19C2.5 20.6569 3.84315 22 5.5 22H19.5C21.1569 22 22.5 20.6569 22.5 19V5ZM20.5 15.4142L16.5 11.4142L7.91421 20H19.5C20.0523 20 20.5 19.5523 20.5 19V15.4142ZM9 8C8.72386 8 8.5 8.22386 8.5 8.5C8.5 8.77614 8.72386 9 9 9C9.27614 9 9.5 8.77614 9.5 8.5C9.5 8.22386 9.27614 8 9 8ZM6.5 8.5C6.5 7.11929 7.61929 6 9 6C10.3807 6 11.5 7.11929 11.5 8.5C11.5 9.88071 10.3807 11 9 11C7.61929 11 6.5 9.88071 6.5 8.5Z'
        fill='currentColor'
      />
    </svg>
  </AppSvgIcon>
);

export default ImageIcon;
