import styled from 'styled-components';
import { Grid } from '@mui/material';
import { maxChannelsWidth } from 'lib/constants';

export const Container = styled(Grid)(({ theme }) => ({
  flexWrap: 'nowrap',
  flexDirection: 'column',
  width: '100%',
  maxWidth: `${maxChannelsWidth}px`,
  position: 'absolute',
  left: 0,
  padding: theme.spacing(2, 2, 0, 0),
}));
