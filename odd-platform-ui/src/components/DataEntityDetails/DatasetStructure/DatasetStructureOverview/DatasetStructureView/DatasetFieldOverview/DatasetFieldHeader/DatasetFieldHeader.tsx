import React, { useCallback } from 'react';
import { Grid, Typography } from '@mui/material';
import type { DataSetField } from 'generated-sources';
import { Permission } from 'generated-sources';
import {
  AppMenuItem,
  AppPopover,
  Button,
  ConfirmationDialog,
  LabelItem,
} from 'components/shared/elements';
import { AddIcon, EditIcon, KebabIcon } from 'components/shared/icons';
import { WithPermissions } from 'components/shared/contexts';
import { useTranslation } from 'react-i18next';
import KeyFieldLabel from 'components/DataEntityDetails/DatasetStructure/shared/KeyFieldLabel/KeyFieldLabel';
import { useDeleteLookupTableDefinition, useGetLookupTableDefinition } from 'lib/hooks';
import { dataEntityDetailsPath, useDataEntityRouteParams } from 'routes';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from 'redux/lib/hooks';
import { getDataEntityDetails } from 'redux/selectors';
import ColumnForm from 'components/shared/elements/forms/ColumnForm';
import DatasetFieldInternalNameForm from './DatasetFieldInternalNameForm/DatasetFieldInternalNameForm';

interface DatasetFieldHeaderProps {
  field: DataSetField;
}

const DatasetFieldHeader = ({ field }: DatasetFieldHeaderProps) => {
  const { t } = useTranslation();
  const { mutateAsync: deleteColumn } = useDeleteLookupTableDefinition();
  const { dataEntityId } = useDataEntityRouteParams();
  const { lookupTableId } = useAppSelector(getDataEntityDetails(dataEntityId));
  const { lookupTableDefinitionId } = field;
  const { data: lookupTableField } = useGetLookupTableDefinition({
    lookupTableId: Number(lookupTableId),
    columnId: Number(field.lookupTableDefinitionId),
    enabled: !!lookupTableDefinitionId && !!lookupTableId,
  });
  const navigate = useNavigate();

  const originalName = field.internalName && (
    <Grid container alignItems='center' width='auto'>
      <LabelItem labelName='Original' variant='body1' />
      <Typography variant='body1' sx={{ ml: 0.5 }} noWrap>
        {field.name}
      </Typography>
    </Grid>
  );

  const handleColumnDelete = useCallback(
    async (ltId: number, cId: number) => {
      await deleteColumn({ lookupTableId: ltId, columnId: cId });
      navigate(dataEntityDetailsPath(dataEntityId, 'structure'));
    },
    [deleteColumn, dataEntityId]
  );

  return (
    <Grid container>
      <Grid item container justifyContent='space-between'>
        <Grid item container alignItems='center' xs={9}>
          <Typography variant='h1' title={field.internalName ?? field.name} noWrap>
            {field.internalName ?? field.name}
          </Typography>
          {field.isPrimaryKey && <KeyFieldLabel sx={{ ml: 1 }} keyType='primary' />}
          {field.isSortKey && <KeyFieldLabel sx={{ ml: 1 }} keyType='sort' />}
          {field.type.isNullable && <KeyFieldLabel sx={{ ml: 1 }} keyType='nullable' />}
          <WithPermissions
            permissionTo={Permission.DATASET_FIELD_INTERNAL_NAME_UPDATE}
            renderContent={({ isAllowedTo: editInternalName }) => (
              <DatasetFieldInternalNameForm
                datasetFieldId={field.id}
                openBtnEl={
                  <Button
                    text={field.internalName ? 'Edit' : 'Add business name'}
                    buttonType='tertiary-m'
                    sx={{ ml: 1, minWidth: 'fit-content' }}
                    startIcon={field.internalName ? <EditIcon /> : <AddIcon />}
                    disabled={!editInternalName}
                  />
                }
              />
            )}
          />
        </Grid>
        {!field.isPrimaryKey && !!lookupTableField && lookupTableId && (
          <Grid item display='flex' alignItems='center'>
            <WithPermissions permissionTo={Permission.LOOKUP_TABLE_DEFINITION_UPDATE}>
              <ColumnForm
                btnEl={
                  <Button
                    text={t('Edit')}
                    buttonType='secondary-m'
                    startIcon={<EditIcon />}
                  />
                }
                lookupTableField={lookupTableField}
                lookupTableId={lookupTableId}
              />
            </WithPermissions>
            <WithPermissions permissionTo={Permission.LOOKUP_TABLE_DEFINITION_DELETE}>
              <AppPopover
                renderOpenBtn={({ onClick, ariaDescribedBy }) => (
                  <Button
                    aria-describedby={ariaDescribedBy}
                    buttonType='secondary-m'
                    icon={<KebabIcon />}
                    onClick={onClick}
                    sx={{ ml: 1 }}
                  />
                )}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: -5, horizontal: 67 }}
              >
                <ConfirmationDialog
                  actionTitle={t('Are you sure you want to delete this column?')}
                  actionName={t('Delete column')}
                  actionText={
                    <>
                      &quot;{field.name}&quot; {t('will be deleted permanently')}
                    </>
                  }
                  onConfirm={() =>
                    handleColumnDelete(lookupTableId, lookupTableField.fieldId)
                  }
                  actionBtn={<AppMenuItem>{t('Delete')}</AppMenuItem>}
                />
              </AppPopover>
            </WithPermissions>
          </Grid>
        )}
      </Grid>
      {originalName}
    </Grid>
  );
};

export default DatasetFieldHeader;
