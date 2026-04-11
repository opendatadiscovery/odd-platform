import React from 'react';
import { FormControlLabel, Grid, RadioGroup, type TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { isAfter, isBefore, isValid } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { MetadataFieldType } from 'generated-sources';
import {
  AppDatePicker,
  AppRadio,
  Input,
  maxDate,
  minDate,
} from 'components/shared/elements';
import { useAppDateTime } from 'lib/hooks';

interface MetadataValueEditorProps {
  metadataType: MetadataFieldType | '';
  metadataValue?: string;
  fieldName?: string;
  labeled?: boolean;
  size?: TextFieldProps['size'];
}

const MetadataValueEditor: React.FC<MetadataValueEditorProps> = ({
  metadataType,
  metadataValue,
  fieldName = 'value',
  labeled,
}) => {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const { metadataFormattedDateTime } = useAppDateTime();

  const defaultText =
    metadataType === MetadataFieldType.ARRAY ? 'item1,item2,...' : 'Value';

  const inputTypes: MetadataFieldType[] = [
    MetadataFieldType.INTEGER,
    MetadataFieldType.FLOAT,
  ];

  if (metadataType === MetadataFieldType.DATETIME) {
    return (
      <Controller
        shouldUnregister
        control={control}
        name={fieldName}
        defaultValue={
          metadataValue && metadataFormattedDateTime(new Date(metadataValue).getTime())
        }
        rules={{
          required: true,
          validate: {
            isValid: d => isValid(d) || t('Date is invalid'),
            greaterThan: v =>
              isAfter(new Date(v), minDate) ||
              `${t('Date should be greater than')} ${minDate.toDateString()}`,
            lessThan: v =>
              isBefore(new Date(v), maxDate) ||
              `${t('Date should be less than')} ${maxDate.toDateString()}`,
          },
        }}
        render={({ field, fieldState }) => (
          <AppDatePicker
            {...field}
            sx={{ mt: 1 }}
            label={labeled ? defaultText : ''}
            disableMaskedInput
            defaultDate={
              metadataType === MetadataFieldType.DATETIME && metadataValue
                ? metadataValue
                : ''
            }
            errorText={fieldState.error?.message}
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
          <RadioGroup {...field} defaultValue={metadataValue || 'true'} sx={{ ml: 0.5 }}>
            <Grid container wrap='nowrap'>
              <FormControlLabel
                key='true'
                value='true'
                control={<AppRadio dataQAId='add_custom_metadata_radio_button_true' />}
                label={t('Yes')}
              />
              <FormControlLabel
                key='false'
                value='false'
                control={<AppRadio dataQAId='add_custom_metadata_radio_button_false' />}
                label={t('No')}
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
        <Input
          {...field}
          sx={{ mt: 1 }}
          variant='main-m'
          label={labeled ? t('Value') : undefined}
          placeholder={labeled ? '' : defaultText}
          type={metadataType && inputTypes.includes(metadataType) ? 'number' : 'text'}
          step={metadataType === MetadataFieldType.FLOAT ? 'any' : '1'}
        />
      )}
    />
  );
};

export default MetadataValueEditor;
