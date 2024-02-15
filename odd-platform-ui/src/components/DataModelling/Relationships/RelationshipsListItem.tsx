import { DataEntityRelationship } from 'generated-sources';
import * as Table from 'components/shared/elements/StyledComponents/Table';
import { Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { dataEntityDetailsPath } from 'routes/dataEntitiesRoutes';

interface Props {
  item: DataEntityRelationship;
}

const RelationshipsListItem = ({ item }: Props) => (
  <Table.RowContainer>
    <Table.Cell $flex='1 0 33%'>
      <Link to={dataEntityDetailsPath(item.id)}>
        <Typography variant='caption' color='button.link.normal.color' fontWeight={500}>
          {item.name}
        </Typography>
      </Link>
    </Table.Cell>
    <Table.Cell $flex='1 0 19%'>
      <Typography variant='body1'>{item.type}</Typography>
    </Table.Cell>
    <Table.Cell $flex='1 0 16%'>
      <Typography variant='body1'>Namespace</Typography>
    </Table.Cell>
    <Table.Cell $flex='1 0 16%'>
      <Typography variant='body1'>Source</Typography>
    </Table.Cell>
    <Table.Cell $flex='1 0 16%'>
      <Typography variant='body1'>Target</Typography>
    </Table.Cell>
  </Table.RowContainer>
);

export default RelationshipsListItem;
