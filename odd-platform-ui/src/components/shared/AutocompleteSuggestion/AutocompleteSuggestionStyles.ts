import { Typography } from '@mui/material';
import styled from 'styled-components';

export const Container = styled(Typography)<{
  component: React.ElementType;
}>(({ theme }) => ({}));

export const NoResultText = styled('span')(({ theme }) => ({
  color: theme.palette.texts.secondary,
}));
export const CreateNewOptionText = styled('span')(({ theme }) => ({
  color: theme.palette.button.dropdown.normal.color,
}));
