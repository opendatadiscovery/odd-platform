import React from 'react';
import type { LookupTable } from 'generated-sources';
import { LookupTableFieldType } from 'generated-sources';
import type { ControllerRenderProps } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import { AppDatePicker, Checkbox, Input } from 'components/shared/elements';
import * as S from './DatasetDataTable.styles';
import AppDateTimePicker from '../../../shared/elements/AppDateTimePicker/AppDateTimePicker';

function renderInput(type: LookupTableFieldType, field: ControllerRenderProps) {
  switch (type) {
    case LookupTableFieldType.VARCHAR:
      return <Input variant='main-m' {...field} />;
    case LookupTableFieldType.BOOLEAN:
      return <Checkbox {...field} />;
    case LookupTableFieldType.DATE:
      return <AppDatePicker {...field} disableMaskedInput defaultDate='' />;
    case LookupTableFieldType.TIME:
      return <AppDateTimePicker {...field} />;
    case LookupTableFieldType.INTEGER:
      return <Input type='number' variant='main-m' {...field} />;
    case LookupTableFieldType.DECIMAL:
      return <Input type='number' variant='main-m' {...field} step='.01' />;
    default:
      return <Input variant='main-m' {...field} />;
  }
}

interface DatasetDataTableRowFormProps {
  lookupTable: LookupTable;
}

const DatasetDataTableRowForm = ({ lookupTable }: DatasetDataTableRowFormProps) => {
  const { handleSubmit, control } = useForm();
  const onSubmit = (data: any) => console.log(data);

  const inputFields = lookupTable.fields.filter(({ isPrimaryKey }) => !isPrimaryKey);

  return (
    <S.Tr>
      <S.Td>
        <Typography variant='caption'>#</Typography>
      </S.Td>
      {inputFields.map(({ fieldId, name, fieldType }) => (
        <S.Td key={fieldId}>
          <Controller
            key={fieldId}
            name={name}
            control={control}
            defaultValue=''
            render={({ field }) => renderInput(fieldType, field)}
          />
        </S.Td>
      ))}
      <S.Td>Save</S.Td>
    </S.Tr>
  );
};

export default DatasetDataTableRowForm;
