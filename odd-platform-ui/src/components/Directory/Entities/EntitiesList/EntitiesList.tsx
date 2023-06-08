import React, { type FC } from 'react';
import {
  AppCircularProgress,
  EmptyContentPlaceholder,
  ScrollableContainer,
} from 'components/shared/elements';
import InfiniteScroll from 'react-infinite-scroll-component';
import type { DataEntity } from 'generated-sources';
import { Grid } from '@mui/material';
import TableHeader from './TableHeader/TableHeader';
import EntityItem from './EntityItem/EntityItem';

interface EntitiesResultsListProps {
  entities: DataEntity[];
  hasNextPage: boolean;
  isEntitiesLoaded: boolean;
  isContentEmpty: boolean;
  fetchNextPage: () => void;
}

const EntitiesResultsList: FC<EntitiesResultsListProps> = ({
  entities,
  fetchNextPage,
  hasNextPage,
  isEntitiesLoaded,
  isContentEmpty,
}) => {
  const flexMap = {
    name: '1 0 40%',
    owner: '1 0 21%',
    type: '0 0 13%',
    createdAt: '0 0 13%',
    updatedAt: '0 0 13%',
  };

  return (
    <>
      <TableHeader flexMap={flexMap} />
      {entities.length > 0 ? (
        <ScrollableContainer $sxHeight={21} id='directory-entities-list'>
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
                name={entity.internalName || entity.externalName}
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
