import type { LookupTable } from 'generated-sources';
import { Button, ConfirmationDialog } from 'components/shared/elements';
import { DeleteIcon, EditIcon } from 'components/shared/icons';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useDeleteLookupTableRow,
  useUpdateLookupTableRow,
} from 'lib/hooks/api/masterData/lookupTableRows';
import type { Row, Table } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { HiddenBox } from './DatasetDataTable.styles';
import type { TableData } from './interfaces';
import { buildTableRowData } from './utils';

interface DatasetDataTableRowActionsProps {
  primaryKeyFieldId: LookupTable['fields'][0]['fieldId'];
  lookupTableId: LookupTable['tableId'];
  row: Row<TableData>;
  table: Table<TableData>;
}

const DatasetDataTableRowActions = ({
  primaryKeyFieldId,
  lookupTableId,
  row,
  table,
}: DatasetDataTableRowActionsProps) => {
  const rowId = Number(row.original[primaryKeyFieldId]);
  const { meta } = table.options;
  const { t } = useTranslation();
  const { mutateAsync: deleteRow } = useDeleteLookupTableRow(lookupTableId);
  const { mutateAsync: updateRow } = useUpdateLookupTableRow();

  const handleDelete = useCallback(async () => {
    await deleteRow(rowId);
  }, [rowId, deleteRow]);

  const setEditedRowsData = useCallback(() => {
    meta?.setEditedRowsData(prev => ({
      ...prev,
      [row.id]: row.original,
    }));
  }, [meta?.setEditedRowsData, row.id, row.original]);

  const cleanEditedRowsData = useCallback(() => {
    meta?.setEditedRowsData(prev => {
      const newEditedRowsData = { ...prev };
      delete newEditedRowsData[row.id];
      return newEditedRowsData;
    });
    row.toggleSelected(false);
  }, [meta?.setEditedRowsData, row.id]);

  const onEdit = useCallback(() => {
    row.toggleSelected(true);
    setEditedRowsData();
  }, [setEditedRowsData, row.getToggleSelectedHandler]);

  const onCancel = useCallback(() => {
    cleanEditedRowsData();
  }, [cleanEditedRowsData]);

  const onSave = useCallback(async () => {
    const editedRow = meta?.editedRowsData[row.id];
    if (editedRow) {
      const lookupTableRowFormData = buildTableRowData(editedRow);
      await updateRow({ lookupTableId, rowId, lookupTableRowFormData });
    }
    cleanEditedRowsData();
  }, [meta?.editedRowsData, row.id]);

  return (
    <HiddenBox>
      {row.getIsSelected() ? (
        <Box display='flex' justifyContent='flex-end' gap={1}>
          <Button text='Save' buttonType='main-m' type='button' onClick={onSave} />
          <Button
            text='Cancel'
            buttonType='secondary-m'
            type='button'
            onClick={onCancel}
          />
        </Box>
      ) : (
        <Box display='flex' justifyContent='flex-end' gap={1}>
          <ConfirmationDialog
            actionTitle={t('Are you sure you want to delete this row?')}
            actionName={t('Delete row')}
            actionText={t('This row will be deleted permanently')}
            onConfirm={handleDelete}
            actionBtn={
              <Button buttonType='tertiary-m' icon={<DeleteIcon />} sx={{ ml: 0.5 }} />
            }
          />
          <Button
            text='Edit'
            onClick={onEdit}
            buttonType='tertiary-m'
            icon={<EditIcon />}
          />
        </Box>
      )}
    </HiddenBox>
  );
};

export default DatasetDataTableRowActions;
