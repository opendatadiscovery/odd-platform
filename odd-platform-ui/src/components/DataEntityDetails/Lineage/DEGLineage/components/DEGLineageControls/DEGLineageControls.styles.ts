import styled from 'styled-components';

export const ControlsContainer = styled('div')(({ theme }) => ({
  backgroundColor: '#F4F5F7',
  boxShadow: theme.shadows[8],
  borderBottomLeftRadius: '8px',
  borderBottomRightRadius: '8px',
  width: '100%',
  justifyContent: 'flex-end',
  position: 'absolute',
  top: 0,
  right: 0,
  zIndex: 1,
  padding: theme.spacing(1),
  display: 'inline-flex',
  alignItems: 'center',
  '& > * + *': { marginLeft: theme.spacing(1) },
}));
