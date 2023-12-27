import type { LookupTable, LookupTableRow } from 'generated-sources';
import { Button, ConfirmationDialog } from 'components/shared/elements';
import { DeleteIcon } from 'components/shared/icons';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeleteLookupTableRow } from 'lib/hooks/api/masterData/lookupTableRows';

interface DatasetDataTableRowActionsProps {
  rowId: LookupTableRow['rowId'];
  lookupTableId: LookupTable['tableId'];
}

const DatasetDataTableRowActions = ({
  rowId,
  lookupTableId,
}: DatasetDataTableRowActionsProps) => {
  const { t } = useTranslation();
  const { mutateAsync: deleteRow } = useDeleteLookupTableRow(lookupTableId);

  const handleDelete = useCallback(() => deleteRow(rowId), [rowId, deleteRow]);

  return (
    <ConfirmationDialog
      actionTitle={t('Are you sure you want to delete this row?')}
      actionName={t('Delete row')}
      actionText={t('This row will be deleted permanently')}
      onConfirm={handleDelete}
      actionBtn={
        <Button buttonType='tertiary-m' icon={<DeleteIcon />} sx={{ ml: 0.5 }} />
      }
    />
  );
};

export default DatasetDataTableRowActions;
