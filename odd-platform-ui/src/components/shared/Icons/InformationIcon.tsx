import React from 'react';
import { SvgIconProps } from '@mui/material/SvgIcon';
import AppSvgIcon from 'components/shared/Icons/AppSvgIcon';
import styled from 'styled-components';
import { Theme } from '@mui/material';

const styles = ({ theme }: { theme?: Theme }) => ({
  color: theme?.palette.texts.hint,
  display: 'flex',
  '&:hover': {
    color: theme?.palette.texts.secondary,
  },
});

const InformationIcon: React.FC<SvgIconProps> = React.forwardRef(
  ({ sx, ...props }, ref) => (
    <AppSvgIcon ref={ref} sx={sx} viewBox='0 0 16 16' {...props}>
      <svg fill='none' xmlns='http://www.w3.org/2000/svg'>
        <circle cx='8' cy='8' r='7.5' stroke='currentColor' />
        <path
          d='M8 8L8 12'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <circle cx='8' cy='4' r='1' fill='currentColor' />
      </svg>
    </AppSvgIcon>
  )
);

export default styled(InformationIcon)(styles);
