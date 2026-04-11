import React, { type FC } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Table } from 'components/shared/elements';
import { useDirectoryRouteParams } from 'routes';

interface TableHeaderProps {
  flexMap: Record<string, string>;
}

const TableHeader: FC<TableHeaderProps> = ({ flexMap }) => {
  const { t } = useTranslation();
  const { typeId } = useDirectoryRouteParams();

  const cells = [
    { name: t('Name'), flex: flexMap.name },
    { name: t('Owner'), flex: flexMap.owner },
    { name: t('Created'), flex: flexMap.createdAt },
    { name: t('Updated '), flex: flexMap.updatedAt },
  ];

  if (!typeId) cells.splice(1, 0, { name: t('Type'), flex: flexMap.type });

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
