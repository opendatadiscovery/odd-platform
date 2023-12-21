import React from 'react';
import type { LookupTableField } from 'generated-sources';
import { Table } from 'components/shared/elements';
import { Typography } from '@mui/material';

interface DatasetDataListHeaderProps {
  fields: LookupTableField[];
}

const DatasetDataListHeader = ({ fields }: DatasetDataListHeaderProps) => {
  const filteredFields = fields.filter(({ isPrimaryKey }) => !isPrimaryKey);

  return (
    <Table.HeaderContainer>
      <Table.Cell $flex='0 0 3%'>
        <Typography variant='caption'>#</Typography>
      </Table.Cell>
      {filteredFields.map(f => (
        <Table.Cell key={f.name} $flex='1 0'>
          <Typography variant='caption'>{f.name}</Typography>
        </Table.Cell>
      ))}
    </Table.HeaderContainer>
  );
};
export default DatasetDataListHeader;
