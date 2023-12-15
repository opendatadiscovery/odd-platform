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
import { useDeleteLookupTableDefinition } from 'lib/hooks';
import { dataEntityDetailsPath, useDataEntityRouteParams } from 'routes';
import { useNavigate } from 'react-router-dom';
import DatasetFieldInternalNameForm from './DatasetFieldInternalNameForm/DatasetFieldInternalNameForm';

type DatasetFieldHeaderProps = { field: DataSetField };

const DatasetFieldHeader = ({ field }: DatasetFieldHeaderProps) => {
  const { t } = useTranslation();
  const { mutateAsync: deleteColumn } = useDeleteLookupTableDefinition();
  const { dataEntityId } = useDataEntityRouteParams();
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
    async (id: number) => {
      await deleteColumn({ lookupTableId: 1, columnId: id });
      navigate(dataEntityDetailsPath(dataEntityId, 'structure'));
    },
    [field.id]
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
        <Grid item display='flex' alignItems='center'>
          {!field.isPrimaryKey && (
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
                onConfirm={() => handleColumnDelete(field.id)}
                actionBtn={<AppMenuItem>{t('Delete')}</AppMenuItem>}
              />
            </AppPopover>
          )}
        </Grid>
      </Grid>
      {originalName}
    </Grid>
  );
};

export default DatasetFieldHeader;
