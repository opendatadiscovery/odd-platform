import type {
  DataEntity,
  DataEntityRelationship,
  DataSourceSafe,
} from 'generated-sources';
import * as Table from 'components/shared/elements/StyledComponents/Table';
import { Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { dataEntityDetailsPath } from 'routes/dataEntitiesRoutes';
import { DatasourceLogo, EntityTypeItem } from 'components/shared/elements';
import * as S from 'components/shared/styled-components';

interface Props {
  item: DataEntityRelationship;
}

interface DatasetInfoProps {
  dataEntityId?: DataEntity['id'];
  oddrn: DataEntity['oddrn'];
}

const DatasetInfo = ({ dataEntityId, oddrn }: DatasetInfoProps) =>
  dataEntityId ? (
    <Link to={dataEntityDetailsPath(dataEntityId)}>
      <Typography variant='caption' color='button.link.normal.color' fontWeight={500}>
        {oddrn.split('/').pop()}
      </Typography>
    </Link>
  ) : (
    <Typography variant='body1'>{oddrn}</Typography>
  );

interface DataSourceInfoProps {
  dataSource: DataSourceSafe;
}

const DataSourceInfo = ({ dataSource }: DataSourceInfoProps) => {
  const { namespace, oddrn, name } = dataSource;
  return (
    <S.Section $flexDirection='column' $gap={0}>
      {namespace?.name ? (
        <Typography variant='body1' title={namespace.name} noWrap>
          {namespace.name}
        </Typography>
      ) : (
        <Typography variant='subtitle2'>not in any namespace</Typography>
      )}
      {name ? (
        <S.Section>
          <DatasourceLogo
            width={24}
            padding={0}
            backgroundColor='transparent'
            name={oddrn}
          />
          <Typography variant='body1' title={name} noWrap>
            {name}
          </Typography>
        </S.Section>
      ) : (
        <Typography variant='subtitle2'>manually created</Typography>
      )}
    </S.Section>
  );
};

const RelationshipsListItem = ({ item }: Props) => (
  <Table.RowContainer>
    <Table.Cell $flex='1 0 33%'>
      <Link to={dataEntityDetailsPath(item.id)}>
        <Typography variant='caption' color='button.link.normal.color' fontWeight={500}>
          {item.name}
        </Typography>
      </Link>
    </Table.Cell>
    <Table.Cell $flex='1 0 16%'>
      <EntityTypeItem entityTypeName={item.type} />
    </Table.Cell>
    <Table.Cell $flex='1 0 19%'>
      <DataSourceInfo dataSource={item.dataSource} />
    </Table.Cell>
    <Table.Cell $flex='1 0 16%'>
      <DatasetInfo
        dataEntityId={item.sourceDataEntityId}
        oddrn={item.sourceDatasetOddrn}
      />
    </Table.Cell>
    <Table.Cell $flex='1 0 16%'>
      <DatasetInfo
        dataEntityId={item.targetDataEntityId}
        oddrn={item.targetDatasetOddrn}
      />
    </Table.Cell>
  </Table.RowContainer>
);

export default RelationshipsListItem;
