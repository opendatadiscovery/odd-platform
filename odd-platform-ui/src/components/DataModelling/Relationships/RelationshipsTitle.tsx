import { Typography } from '@mui/material';
import { NumberFormatted } from 'components/shared/elements';
import React from 'react';
import styled from 'styled-components';

interface Props {
  total: number;
}

// TODO: create shared styled component for basic and flex box
const Box = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RelationshipsTitle = ({ total = 0 }: Props) => (
  <Box>
    <Typography variant='h1'>Relationships</Typography>
    <Typography variant='subtitle1' color='texts.info'>
      <NumberFormatted value={total} /> relationships overall
    </Typography>
  </Box>
);

export default RelationshipsTitle;
