import React, { type FC } from 'react';
import { Table } from 'components/shared/elements';
import { useAppParams } from 'lib/hooks';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface TableHeaderProps {
  flexMap: Record<string, string>;
}

const TableHeader: FC<TableHeaderProps> = ({ flexMap }) => {
  const { t } = useTranslation();
  const { typeId } = useAppParams();

  const cells = [
    { name: t('Name'), flex: flexMap.name },
    { name: t('Owner'), flex: flexMap.owner },
    { name: t('Created at'), flex: flexMap.createdAt },
    { name: t('Updated at '), flex: flexMap.updatedAt },
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
