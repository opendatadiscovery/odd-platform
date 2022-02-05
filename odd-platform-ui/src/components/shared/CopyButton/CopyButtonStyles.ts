import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { propsChecker } from 'lib/helpers';
import { ButtonColors } from '../AppButton/AppButtonStyles';

export type Positions = 'top' | 'bottom' | 'left' | 'right';

interface TextProps {
  $color: ButtonColors;
}

export const Text = styled(Typography, {
  shouldForwardProp: propsChecker,
})<TextProps>(({ theme, $color }) => ({
  color: theme.palette.button[$color].normal.color,
}));
