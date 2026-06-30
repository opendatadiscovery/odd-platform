import React from 'react';
import type { LinkedUrl, QueryExample } from 'generated-sources';
import { AssetKind, Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import { queryExamplesPath, termDetailsPath } from 'routes';
import { Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import FavoriteStar from '../FavoriteStar/FavoriteStar';
import RecentlyViewedTag from '../RecentlyViewedTag/RecentlyViewedTag';
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
  // The standalone Query Examples list shows a favorite star; the linked-QE tables (term / dataset
  // details) reuse this row without one, so the star is opt-in.
  showFavorite?: boolean;
}

const QueryExamplesListItem = ({
  queryExample,
  isTerm,
  entityId,
  showFavorite,
}: QueryExampleSearchResultsItemProps) => {
  const linkedTerms: LinkedUrl[] = queryExample?.linkedTerms?.items
    ? queryExample?.linkedTerms?.items.map(term => ({
        name: term.term.name,
        url: termDetailsPath(term.term.id),
      }))
    : [];
  return (
    <Table.RowContainer $minWidth={showFavorite ? Table.QE_TABLE_MIN_WIDTH : undefined}>
      <Table.Cell $flex='1 0 1' $sticky={showFavorite}>
        <Grid container alignItems='center' flexWrap='nowrap' gap={0.5}>
          <Link to={queryExamplesPath(queryExample.id)}>
            <Typography
              variant='caption'
              color='button.link.normal.color'
              fontWeight={500}
            >
              {queryExample.id}
            </Typography>
          </Link>
          {showFavorite && (
            <FavoriteStar assetKind={AssetKind.QUERY_EXAMPLE} assetId={queryExample.id} />
          )}
        </Grid>
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
      {showFavorite && (
        <Table.Cell $flex='1 0 10%'>
          <RecentlyViewedTag
            assetKind={AssetKind.QUERY_EXAMPLE}
            assetId={queryExample.id}
          />
        </Table.Cell>
      )}
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
