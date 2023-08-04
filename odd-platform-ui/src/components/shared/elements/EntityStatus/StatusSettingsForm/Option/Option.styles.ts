import styled from 'styled-components';
import { Typography } from '@mui/material';

export const Option = styled(Typography)<{
  $selected: boolean;
}>`
  margin-top: 4px;
  padding: 6px 8px;
  width: 100%;
  border-radius: 4px;
  background-color: ${({ $selected, theme }) =>
    $selected ? theme.palette.backgrounds.secondary : theme.palette.backgrounds.default};

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.palette.backgrounds.primary};
  }
`;
