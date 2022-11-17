import styled from 'styled-components';

export const ControlsContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  padding: theme.spacing(1),
  display: 'inline-flex',
  alignItems: 'center',
  '& > * + *': { marginLeft: theme.spacing(1) },
}));
