import React from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/icons/AppSvgIcon';
import styled from 'styled-components';
import type { Theme } from '@mui/material';

const styles = ({ theme }: { theme?: Theme }) => ({
  color: theme?.palette.texts.info,
  display: 'flex',
  '&:hover': { color: theme?.palette.texts.secondary },
});

const InformationIcon: React.FC<SvgIconProps> = React.forwardRef(
  ({ sx, ...props }, ref) => (
    <AppSvgIcon ref={ref} sx={sx} viewBox='0 0 16 16' {...props}>
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
          d='M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM8 5C8.55229 5 9 4.55228 9 4C9 3.44772 8.55229 3 8 3C7.44772 3 7 3.44772 7 4C7 4.55228 7.44772 5 8 5ZM9 8C9 7.44772 8.55229 7 8 7C7.44772 7 7 7.44772 7 8V12C7 12.5523 7.44772 13 8 13C8.55229 13 9 12.5523 9 12V8Z'
          fill='currentColor'
        />
      </svg>
    </AppSvgIcon>
  )
);

export default styled(InformationIcon)(styles);
