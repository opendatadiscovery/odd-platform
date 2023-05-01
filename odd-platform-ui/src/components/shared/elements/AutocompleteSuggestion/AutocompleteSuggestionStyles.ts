import styled from 'styled-components';

export const NoResultText = styled('span')(({ theme }) => ({
  color: theme.palette.texts.secondary,
}));

export const CreateNewOptionText = styled('span')(({ theme }) => ({
  color: theme.palette.texts.action,
}));
