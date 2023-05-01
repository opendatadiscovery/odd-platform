import { Radio, radioClasses } from '@mui/material';
import styled from 'styled-components';

export const StyledRadio = styled(Radio)(() => ({
  [`&.${radioClasses.root}`]: {
    '&:hover': { backgroundColor: 'unset' },
  },
}));

const iconStyles = {
  borderRadius: '50%',
  width: 16,
  height: 16,
};

export const Icon = styled('span')(({ theme }) => ({
  boxShadow: `0 0 0 1px ${theme.palette.backgrounds.element}`,
  ...iconStyles,
}));

export const IconChecked = styled(Icon)(({ theme }) => ({
  backgroundColor: theme.palette.backgrounds.element,
  '&:before': {
    display: 'block',
    content: '""',
    boxShadow: `inset 0 0 0 2px ${theme.palette.common.white}`,
    ...iconStyles,
  },
}));
