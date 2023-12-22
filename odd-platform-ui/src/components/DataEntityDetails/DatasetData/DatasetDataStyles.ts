import styled, { css } from 'styled-components';
import { Box } from '@mui/material';

export const Header = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: theme.spacing(0, 0.25, 0, 0),
}));

export const HeaderCell = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: theme.spacing(0, 1),
  borderBottom: `1px solid ${theme.palette.border.primary}`,
  overflow: 'hidden',
}));

export const RowCell = styled(HeaderCell)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: theme.spacing(1.25, 1),
  overflow: 'hidden',
}));

export const Row = styled(Box)(
  ({ theme }) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  &:hover {
    ${RowCell} {
      background-color: ${theme.palette.backgrounds.primary};
    }
  },
`
);
