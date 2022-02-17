import React from 'react';
import {
  FormControlLabel,
  Grid,
  RadioGroup,
  TextFieldProps,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { format, isAfter, isBefore, isValid } from 'date-fns';
import { MetadataFieldType } from 'generated-sources';
import AppDatePicker, {
  maxDate,
  metadataDatePickerInputFormat,
  minDate,
} from 'components/shared/AppDatePicker/AppDatePicker';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import AppRadio from 'components/shared/AppRadio/AppRadio';

interface MetadataValueEditFieldProps {
  metadataType: MetadataFieldType | '';
  metadataValue?: string;
  fieldName?: string;
  labeled?: boolean;
  size?: TextFieldProps['size'];
}

const MetadataValueEditField: React.FC<MetadataValueEditFieldProps> = ({
  metadataType,
  metadataValue,
  fieldName = 'value',
  labeled,
  size,
}) => {
  const { control } = useFormContext();

  const defaultText =
    metadataType === MetadataFieldType.ARRAY ? 'item1,item2,...' : 'Value';

  if (metadataType === MetadataFieldType.DATETIME) {
    return (
      <Controller
        control={control}
        name={fieldName}
        defaultValue={
          metadataValue &&
          format(new Date(metadataValue), metadataDatePickerInputFormat)
        }
        rules={{
          validate: {
            isValid: d => isValid(d) || 'Date is invalid',
            greaterThan: v =>
              isAfter(new Date(v), minDate) ||
              `Date should be greater than ${minDate.toDateString()}`,
            lessThan: v =>
              isBefore(new Date(v), maxDate) ||
              `Date should be less than ${maxDate.toDateString()}`,
          },
        }}
        render={({ field, fieldState }) => (
          <AppDatePicker
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...field}
            sx={{ mt: 1 }}
            label={labeled ? defaultText : ''}
            disableMaskedInput
            defaultDate={
              metadataType === MetadataFieldType.DATETIME && metadataValue
                ? metadataValue
                : ''
            }
            showInputError={!!fieldState.error?.message}
            inputHelperText={fieldState.error?.message}
          />
        )}
      />
    );
  }
  if (metadataType === MetadataFieldType.BOOLEAN) {
    return (
      <Controller
        name={fieldName}
        control={control}
        defaultValue={metadataValue || 'true'}
        render={({ field }) => (
          <RadioGroup
            {...field}
            defaultValue={metadataValue || 'true'}
            sx={{ ml: 0.5 }}
          >
            <Grid container wrap="nowrap">
              <FormControlLabel
                key="new"
                value="true"
                control={<AppRadio />}
                label="Yes"
              />
              <FormControlLabel
                key="new"
                value="false"
                control={<AppRadio />}
                label="No"
              />
            </Grid>
          </RadioGroup>
        )}
      />
    );
  }
  return (
    <Controller
      name={fieldName}
      control={control}
      defaultValue={metadataValue || ''}
      rules={{ required: true }}
      render={({ field }) => (
        <AppTextField
          {...field}
          sx={{ mt: 1 }}
          size={size}
          fullWidth
          label={labeled ? 'Value' : null}
          placeholder={labeled ? '' : defaultText}
          inputProps={{
            type:
              metadataType &&
              [
                MetadataFieldType.INTEGER,
                MetadataFieldType.FLOAT,
              ].includes(metadataType)
                ? 'number'
                : 'text',
            step: metadataType === MetadataFieldType.FLOAT ? 'any' : '1',
            lang: 'en',
          }}
        />
      )}
    />
  );
};

export default MetadataValueEditField;
