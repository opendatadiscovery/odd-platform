import { Typography } from '@mui/material';
import React from 'react';
import * as Table from '../StyledComponents/Table';

const RelationshipListHeader = () => (
  <Table.HeaderContainer>
    <Table.Cell $flex='0 0 40px'>
      <Typography variant='caption'>#</Typography>
    </Table.Cell>
    <Table.Cell $flex='1 0 25%'>
      <Typography variant='caption'>Name</Typography>
    </Table.Cell>
    <Table.Cell $flex='1 0 15%'>
      <Typography variant='caption'>Type</Typography>
    </Table.Cell>
    <Table.Cell $flex='1 0 55%'>
      <Typography variant='caption'>Details</Typography>
    </Table.Cell>
  </Table.HeaderContainer>
);

export default RelationshipListHeader;
