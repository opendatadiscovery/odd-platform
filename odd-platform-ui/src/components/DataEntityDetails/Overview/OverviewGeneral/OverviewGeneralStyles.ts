import styled from 'styled-components';

export const OddrnValue = styled('span')(({ theme }) => ({
  display: 'block',
  width: '100%',
  whiteSpace: 'normal',
  borderRadius: '4px',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.backgrounds.primary,
}));
