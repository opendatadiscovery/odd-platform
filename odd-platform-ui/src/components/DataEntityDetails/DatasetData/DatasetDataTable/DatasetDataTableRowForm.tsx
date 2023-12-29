import React from 'react';
import type { LookupTable } from 'generated-sources';
import { LookupTableFieldType } from 'generated-sources';
import type { ControllerRenderProps } from 'react-hook-form';
import { Controller, useFormContext } from 'react-hook-form';
import { Grid, Typography } from '@mui/material';
import {
  AppDatePicker,
  AppDateTimePicker,
  Button,
  Checkbox,
  Input,
} from 'components/shared/elements';
import * as S from './DatasetDataTable.styles';

interface DatasetDataTableRowFormProps {
  lookupTable: LookupTable;
  onCancel: () => void;
}

const DatasetDataTableRowForm = ({
  lookupTable,
  onCancel,
}: DatasetDataTableRowFormProps) => {
  const { control } = useFormContext();

  const inputFields = lookupTable.fields.filter(({ isPrimaryKey }) => !isPrimaryKey);

  const renderInput = (type: LookupTableFieldType, field: ControllerRenderProps) => {
    switch (type) {
      case LookupTableFieldType.VARCHAR:
        return <Input variant='main-m' {...field} />;
      case LookupTableFieldType.BOOLEAN:
        return <Checkbox {...field} />;
      case LookupTableFieldType.DATE:
        return <AppDatePicker {...field} disableMaskedInput defaultDate='' />;
      case LookupTableFieldType.TIME:
        return <AppDateTimePicker {...field} disableMaskedInput />;
      case LookupTableFieldType.INTEGER:
        return <Input type='number' variant='main-m' {...field} />;
      case LookupTableFieldType.DECIMAL:
        return <Input type='number' variant='main-m' {...field} step='.01' />;
      default:
        return <Input variant='main-m' {...field} />;
    }
  };

  return (
    <S.Tr>
      <S.Td>
        <Typography variant='caption'>#</Typography>
      </S.Td>
      {inputFields.map(({ fieldId, fieldType, defaultValue }) => (
        <S.Td key={fieldId}>
          <Controller
            name={String(fieldId)}
            control={control}
            defaultValue={defaultValue ?? ''}
            render={({ field }) => renderInput(fieldType, field)}
          />
        </S.Td>
      ))}
      <S.Td>
        <Grid container justifyContent='space-between'>
          <Button
            text='Save'
            buttonType='main-m'
            form='reference-data-row-form'
            type='submit'
          />
          <Button text='Cancel' onClick={onCancel} buttonType='secondary-m' />
        </Grid>
      </S.Td>
    </S.Tr>
  );
};

export default DatasetDataTableRowForm;
