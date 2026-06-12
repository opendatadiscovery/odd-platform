import React from 'react';
import type { LinkedUrl, QueryExample } from 'generated-sources';
import { Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import { queryExamplesPath, termDetailsPath } from 'routes';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import TruncatedCell from '../TruncatedCell/TruncatedCell';
import Markdown from '../Markdown/Markdown';
import CollapsibleInfoContainer from '../CollapsibleInfoContainer/CollapsibleInfoContainer';
import * as Table from '../StyledComponents/Table';
import QueryExamplesUnlinkButton from './QueryExamplesUnlinkButton';
import QueryExamplesTermUnlinkButton from './QueryExamplesTermUnlinkButton';

interface QueryExampleSearchResultsItemProps {
  queryExample: QueryExample;
  isTerm?: boolean;
  entityId?: number;
}

const QueryExamplesListItem = ({
  queryExample,
  isTerm,
  entityId,
}: QueryExampleSearchResultsItemProps) => {
  const linkedTerms: LinkedUrl[] = queryExample?.linkedTerms?.items
    ? queryExample?.linkedTerms?.items.map(term => ({
        name: term.term.name,
        url: termDetailsPath(term.term.id),
      }))
    : [];
  return (
    <Table.RowContainer>
      <Table.Cell $flex='1 0 1'>
        <Link to={queryExamplesPath(queryExample.id)}>
          <Typography variant='caption' color='button.link.normal.color' fontWeight={500}>
            {queryExample.id}
          </Typography>
        </Link>
      </Table.Cell>
      <Table.Cell $flex='1 0 15%'>
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
      <Table.Cell $flex='1 0 5%'>
        <TruncatedCell dataList={queryExample.linkedEntities} externalEntityId={1} />
      </Table.Cell>
      <Table.Cell $flex='1 0 5%'>
        <TruncatedCell dataList={linkedTerms} externalEntityId={1} />
      </Table.Cell>
      <Table.HiddenCell $flex='0 0 15%' $justifyContent='right'>
        <WithPermissions
          permissionTo={
            isTerm
              ? Permission.QUERY_EXAMPLE_TERM_DELETE
              : Permission.QUERY_EXAMPLE_DATASET_DELETE
          }
        >
          {entityId &&
            (isTerm ? (
              <QueryExamplesTermUnlinkButton
                queryExampleId={queryExample.id}
                termId={entityId}
              />
            ) : (
              <QueryExamplesUnlinkButton
                queryExampleId={queryExample.id}
                dataEntityId={entityId}
              />
            ))}
        </WithPermissions>
      </Table.HiddenCell>
    </Table.RowContainer>
  );
};

export default QueryExamplesListItem;
