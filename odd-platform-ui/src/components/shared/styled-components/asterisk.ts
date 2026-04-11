import styled from 'styled-components';

const Asterisk = styled('span')(({ theme }) => ({
  color: theme.palette.warning.main,
}));

export default Asterisk;
