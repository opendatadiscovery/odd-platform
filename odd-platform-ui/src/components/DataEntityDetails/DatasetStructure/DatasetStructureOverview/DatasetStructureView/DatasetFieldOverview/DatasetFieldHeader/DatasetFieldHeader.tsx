import React from 'react';
import { Grid, Typography } from '@mui/material';
import type { DataSetField } from 'generated-sources';
import { Button, LabelItem } from 'components/shared/elements';
import { AddIcon, EditIcon } from 'components/shared/icons';
import DatasetFieldInternalNameForm from './DatasetFieldInternalNameForm/DatasetFieldInternalNameForm';
import KeyFieldLabel from '../../../../shared/KeyFieldLabel/KeyFieldLabel';

type DatasetFieldHeaderProps = { field: DataSetField };

const DatasetFieldHeader = ({ field }: DatasetFieldHeaderProps) => {
  const originalName = field.internalName && (
    <Grid container alignItems='center' width='auto'>
      <LabelItem labelName='Original' variant='body1' />
      <Typography variant='body1' sx={{ ml: 0.5 }} noWrap>
        {field.name}
      </Typography>
    </Grid>
  );

  return (
    <Grid container flexDirection='column'>
      <Grid container flexWrap='nowrap' alignItems='center'>
        <Typography variant='h1' title={field?.internalName || field.name} noWrap>
          {field?.internalName || field.name}
        </Typography>
        {field?.isPrimaryKey && <KeyFieldLabel sx={{ ml: 1 }} keyType='primary' />}
        {field?.isSortKey && <KeyFieldLabel sx={{ ml: 1 }} keyType='sort' />}
        {field?.type.isNullable && <KeyFieldLabel sx={{ ml: 1 }} keyType='nullable' />}
        <DatasetFieldInternalNameForm
          openBtnEl={
            <Button
              text={field.internalName ? 'Edit' : 'Add business name'}
              buttonType='tertiary-m'
              sx={{ ml: 1, minWidth: 'fit-content' }}
              startIcon={field.internalName ? <EditIcon /> : <AddIcon />}
            />
          }
          datasetFieldId={field.id}
        />
      </Grid>
      {originalName}
    </Grid>
  );
};

export default DatasetFieldHeader;
