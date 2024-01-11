import { Button, ConfirmationDialog, Table } from 'components/shared/elements';
import type { LookupTable } from 'generated-sources';
import { Permission } from 'generated-sources';
import React, { useCallback } from 'react';
import { Typography } from '@mui/material';
import { DeleteIcon, EditIcon } from 'components/shared/icons';
import { useTranslation } from 'react-i18next';
import { useDeleteLookupTable } from 'lib/hooks/api/masterData/lookupTables';
import { dataEntityDetailsPath } from 'routes';
import { Link } from 'react-router-dom';
import { WithPermissions } from 'components/shared/contexts';
import LookupTableForm from '../LookupTableForm';

interface LookupTablesListItemProps {
  item: LookupTable;
}

const LookupTablesListItem = ({ item }: LookupTablesListItemProps) => {
  const { t } = useTranslation();
  const { mutateAsync: deleteLookupTable } = useDeleteLookupTable();

  const handleDelete = useCallback(
    async () => await deleteLookupTable(item.tableId),
    [item.tableId, deleteLookupTable]
  );

  return (
    <Table.RowContainer>
      <Table.Cell $flex='1 0'>
        <Link to={dataEntityDetailsPath(item.datasetId)}>
          <Typography variant='caption' color='button.link.normal.color' fontWeight={500}>
            {item.name}
          </Typography>
        </Link>
      </Table.Cell>
      <Table.Cell $flex='1 0 30%'>{item.description}</Table.Cell>
      <Table.Cell $flex='1 0'>
        {item.namespace ? (
          <Typography variant='body1' title={item.namespace.name} noWrap>
            {item.namespace.name}
          </Typography>
        ) : (
          <Typography variant='subtitle2'>not in any namespace</Typography>
        )}
      </Table.Cell>
      <Table.HiddenCell $flex='0 0 15%' $justifyContent='right'>
        <WithPermissions permissionTo={Permission.LOOKUP_TABLE_UPDATE}>
          <LookupTableForm
            lookupTable={item}
            btnEl={
              <Button
                text={t('Edit')}
                buttonType='secondary-m'
                startIcon={<EditIcon />}
                sx={{ mr: 0.5 }}
              />
            }
          />
        </WithPermissions>
        <WithPermissions permissionTo={Permission.LOOKUP_TABLE_DELETE}>
          <ConfirmationDialog
            actionTitle={t('Are you sure you want to delete this lookup table?')}
            actionName={t('Delete lookup table')}
            actionText={
              <>
                &quot;{item.name}&quot; {t('will be deleted permanently')}
              </>
            }
            onConfirm={handleDelete}
            actionBtn={
              <Button
                text={t('Delete')}
                buttonType='secondary-m'
                startIcon={<DeleteIcon />}
              />
            }
          />
        </WithPermissions>
      </Table.HiddenCell>
    </Table.RowContainer>
  );
};

export default LookupTablesListItem;
