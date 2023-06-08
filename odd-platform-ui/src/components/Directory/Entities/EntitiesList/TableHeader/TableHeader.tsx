import React, { type FC } from 'react';
import { Table } from 'components/shared/elements';
import { useAppParams } from 'lib/hooks';
import { Typography } from '@mui/material';

interface TableHeaderProps {
  flexMap: Record<string, string>;
}

const TableHeader: FC<TableHeaderProps> = ({ flexMap }) => {
  const { typeId } = useAppParams();

  const cells = [
    { name: 'Name', flex: flexMap.name },
    { name: 'Owner', flex: flexMap.owner },
    { name: 'Created', flex: flexMap.createdAt },
    { name: 'Last update', flex: flexMap.updatedAt },
  ];

  if (!typeId) cells.splice(1, 0, { name: 'Type', flex: flexMap.type });

  return (
    <Table.HeaderContainer>
      {cells.map(cell => (
        <Table.Cell key={cell.name} $flex={cell.flex}>
          <Typography variant='caption'>{cell.name}</Typography>
        </Table.Cell>
      ))}
    </Table.HeaderContainer>
  );
};

export default TableHeader;
