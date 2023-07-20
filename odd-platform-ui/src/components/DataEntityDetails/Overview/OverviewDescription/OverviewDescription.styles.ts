import styled from 'styled-components';

export const CollapseControls = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));
