import { Table } from 'components/shared/elements';
import type { LookupTable } from 'generated-sources';
import React from 'react';
import { Typography } from '@mui/material';

interface LookupTablesListItemProps {
  item: LookupTable;
}

const LookupTablesListItem = ({ item }: LookupTablesListItemProps) => {
  console.log('LookupTablesListItem', item);
  return (
    <Table.RowContainer>
      <Table.Cell $flex='1 0'>{item.tableName}</Table.Cell>
      <Table.Cell $flex='1 0 35%'>{item.description}</Table.Cell>
      <Table.Cell $flex='1 0'>
        {item.namespace ? (
          <Typography variant='body1' title={item.namespace.name} noWrap>
            {item.namespace.name}
          </Typography>
        ) : (
          <Typography variant='subtitle2'>not in any namespace</Typography>
        )}
      </Table.Cell>
      <Table.Cell $flex='0 0 10%'>actions</Table.Cell>
    </Table.RowContainer>
  );
};

export default LookupTablesListItem;
