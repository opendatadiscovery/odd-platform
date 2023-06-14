import React, { type FC } from 'react';
import {
  AppCircularProgress,
  EmptyContentPlaceholder,
  ScrollableContainer,
} from 'components/shared/elements';
import InfiniteScroll from 'react-infinite-scroll-component';
import type { DataEntity } from 'generated-sources';
import { Grid } from '@mui/material';
import type { ErrorState } from 'redux/interfaces';
import type { DataSourceEntityList } from 'lib/interfaces';
import type { InfiniteQueryObserverResult } from '@tanstack/react-query';
import EntityItem from './EntityItem/EntityItem';
import TableHeader from './TableHeader/TableHeader';

interface EntitiesResultsListProps {
  entities: DataEntity[];
  hasNextPage: boolean;
  isEntitiesLoaded: boolean;
  isContentEmpty: boolean;
  fetchNextPage: () => Promise<
    InfiniteQueryObserverResult<DataSourceEntityList, ErrorState>
  >;
}

const EntitiesResultsList: FC<EntitiesResultsListProps> = ({
  entities,
  fetchNextPage,
  hasNextPage,
  isEntitiesLoaded,
  isContentEmpty,
}) => {
  const flexMap = {
    name: '1 0 32%',
    owner: '1 0 23%',
    type: '0 0 15%',
    createdAt: '0 0 15%',
    updatedAt: '0 0 15%',
  };

  return (
    <>
      <TableHeader flexMap={flexMap} />
      {entities.length > 0 ? (
        <ScrollableContainer $offsetY={190} id='directory-entities-list'>
          <InfiniteScroll
            scrollableTarget='directory-entities-list'
            dataLength={entities.length}
            next={fetchNextPage}
            hasMore={hasNextPage}
            loader={
              <Grid container justifyContent='center' mt={3}>
                <AppCircularProgress size={30} background='transparent' />
              </Grid>
            }
          >
            {entities.map(entity => (
              <EntityItem
                key={entity.id}
                id={entity.id}
                name={entity.internalName ?? entity.externalName}
                type={entity.type}
                flexMap={flexMap}
                ownership={entity.ownership}
                entityClasses={entity.entityClasses}
                createdAt={entity.createdAt}
                updatedAt={entity.updatedAt}
              />
            ))}
          </InfiniteScroll>
        </ScrollableContainer>
      ) : (
        <EmptyContentPlaceholder
          isContentLoaded={isEntitiesLoaded}
          isContentEmpty={isContentEmpty}
          offsetTop={190}
        />
      )}
    </>
  );
};

export default EntitiesResultsList;
