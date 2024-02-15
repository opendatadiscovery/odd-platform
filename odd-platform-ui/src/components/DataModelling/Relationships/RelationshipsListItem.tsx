import type { DataEntity, DataEntityRelationship } from 'generated-sources';
import * as Table from 'components/shared/elements/StyledComponents/Table';
import { Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { dataEntityDetailsPath } from 'routes/dataEntitiesRoutes';
import { EntityTypeItem } from 'components/shared/elements';

interface Props {
  item: DataEntityRelationship;
}

interface DatasetCellProps {
  dataEntityId?: DataEntity['id'];
  oddrn: DataEntity['oddrn'];
}

const DatasetCell = ({ dataEntityId, oddrn }: DatasetCellProps) =>
  dataEntityId ? (
    <Link to={dataEntityDetailsPath(dataEntityId)}>
      <Typography variant='caption' color='button.link.normal.color' fontWeight={500}>
        {oddrn.split('/').pop()}
      </Typography>
    </Link>
  ) : (
    <Typography variant='body1'>{oddrn}</Typography>
  );

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
      <EntityTypeItem entityTypeName={item.type} />
    </Table.Cell>
    <Table.Cell $flex='1 0 16%'>
      <Typography variant='body1'>Namespace</Typography>
    </Table.Cell>
    <Table.Cell $flex='1 0 16%'>
      <DatasetCell
        dataEntityId={item.sourceDataEntityId}
        oddrn={item.sourceDatasetOddrn}
      />
    </Table.Cell>
    <Table.Cell $flex='1 0 16%'>
      <DatasetCell
        dataEntityId={item.targetDataEntityId}
        oddrn={item.targetDatasetOddrn}
      />
    </Table.Cell>
  </Table.RowContainer>
);

export default RelationshipsListItem;
