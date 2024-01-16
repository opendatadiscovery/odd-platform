import React from 'react';
import type { QueryExample } from 'generated-sources';
import { Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import { queryExamplesPath } from 'routes';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import TruncatedCell from '../TruncatedCell/TruncatedCell';
import Markdown from '../Markdown/Markdown';
import CollapsibleInfoContainer from '../CollapsibleInfoContainer/CollapsibleInfoContainer';
import * as Table from '../StyledComponents/Table';
import QueryExamplesUnlinkButton from './QueryExamplesUnlinkButton';

interface QueryExampleSearchResultsItemProps {
  queryExample: QueryExample;
  dataEntityId?: number;
}

const QueryExamplesListItem = ({
  queryExample,
  dataEntityId,
}: QueryExampleSearchResultsItemProps) => (
  <Table.RowContainer>
    <Table.Cell $flex='1 0 1'>
      <Link to={queryExamplesPath(queryExample.id)}>
        <Typography variant='caption' color='button.link.normal.color' fontWeight={500}>
          {queryExample.id}
        </Typography>
      </Link>
    </Table.Cell>
    <Table.Cell $flex='1 0 25%'>
      <CollapsibleInfoContainer
        style={{ border: 'none' }}
        initialMaxHeight={96}
        content={<Markdown value={queryExample.definition} disableCopy />}
      />
    </Table.Cell>
    <Table.Cell $flex='1 0 25%'>
      <CollapsibleInfoContainer
        style={{ border: 'none' }}
        initialMaxHeight={96}
        content={<Markdown value={queryExample.query} disableCopy />}
      />
    </Table.Cell>
    <Table.Cell $flex='1 0'>
      <TruncatedCell dataList={queryExample.linkedEntities} externalEntityId={1} />
    </Table.Cell>
    <Table.HiddenCell $flex='0 0 15%' $justifyContent='right'>
      <WithPermissions permissionTo={Permission.QUERY_EXAMPLE_DATASET_DELETE}>
        {dataEntityId && (
          <QueryExamplesUnlinkButton
            queryExampleId={queryExample.id}
            dataEntityId={dataEntityId}
          />
        )}
      </WithPermissions>
    </Table.HiddenCell>
  </Table.RowContainer>
);

export default QueryExamplesListItem;
