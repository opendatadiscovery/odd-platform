import React, { useMemo } from 'react';
import { useAppSelector } from 'redux/lib/hooks';
import { getDatasetLookupTableId } from 'redux/selectors';
import { useDataEntityRouteParams } from 'routes';
import { useGetLookupTable } from 'lib/hooks';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useGetReferenceData } from 'lib/hooks/api/masterData/referenceData';
import { EmptyContentPlaceholder, ScrollableContainer } from 'components/shared/elements';
import { Typography } from '@mui/material';
import LookupTablesSkeleton from 'components/MasterData/LookupTables/LookupTablesSkeleton';
import * as Table from './DatasetDataStyles';
import DatasetDataTableRowActions from './DatasetDataTableRowActions';

const DatasetData: React.FC = () => {
  const { dataEntityId } = useDataEntityRouteParams();
  const lookupTableId = useAppSelector(getDatasetLookupTableId(dataEntityId))!;
  const { data: lookupTable } = useGetLookupTable({ lookupTableId });

  const { data, hasNextPage, fetchNextPage, isLoading } = useGetReferenceData({
    lookupTableId,
    size: 30,
  });

  const lookupTableRowList = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data?.pages]
  );

  const isEmpty = useMemo(
    () => lookupTableRowList.length === 0 && !isLoading,
    [lookupTableRowList, isLoading]
  );

  if (!lookupTable) return null;

  const fieldNames = lookupTable.fields
    .filter(({ isPrimaryKey }) => !isPrimaryKey)
    .map(f => f.name);

  return (
    <ScrollableContainer id='reference-data-list' $offsetY={175} mt={2}>
      <Table.Header>
        <Table.HeaderCell flex='0 0 3%'>
          <Typography variant='caption'>#</Typography>
        </Table.HeaderCell>
        {fieldNames.map(name => (
          <Table.HeaderCell key={name} flex='1 0 200px'>
            <Typography variant='caption'>{name}</Typography>
          </Table.HeaderCell>
        ))}
        <Table.HeaderCell flex='1 0 5%' />
      </Table.Header>
      <InfiniteScroll
        style={{ overflow: 'visible' }}
        scrollableTarget='reference-data-list'
        dataLength={lookupTableRowList.length}
        next={fetchNextPage}
        hasMore={hasNextPage}
        scrollThreshold='200px'
        loader={<LookupTablesSkeleton />}
      >
        {lookupTableRowList.map(row => (
          <Table.Row key={JSON.stringify(row)}>
            {row.items.map((item, index) => (
              <Table.RowCell
                key={item.fieldId}
                flex={index === 0 ? '0 0 3%' : '1 0 200px'}
              >
                <Typography variant='body2'>{item.value}</Typography>
              </Table.RowCell>
            ))}
            <Table.RowCell flex='1 0 5%'>
              <Table.HiddenContent>
                <DatasetDataTableRowActions row={row} lookupTableId={lookupTableId} />
              </Table.HiddenContent>
            </Table.RowCell>
          </Table.Row>
        ))}
        {isEmpty && <EmptyContentPlaceholder offsetTop={260} />}
      </InfiniteScroll>
    </ScrollableContainer>
  );
};

export default DatasetData;
