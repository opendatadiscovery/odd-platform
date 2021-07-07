import React from 'react';
import {
  TextField,
  Grid,
  RadioGroup,
  Radio,
  FormControlLabel,
  withStyles,
  TextFieldProps,
} from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { Controller, useFormContext } from 'react-hook-form';
import { format } from 'date-fns';
import { MetadataFieldType } from 'generated-sources';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { styles, StylesType } from './MetadataValueEditorStyles';

interface MetadataValueEditFieldProps extends StylesType {
  metadataType: MetadataFieldType | '';
  metadataValue?: string;
  fieldName?: string;
  labeled?: boolean;
  size?: TextFieldProps['size'];
}

const MetadataValueEditField: React.FC<MetadataValueEditFieldProps> = ({
  classes,
  metadataType,
  metadataValue,
  fieldName = 'value',
  labeled,
  size,
}) => {
  const { control, setValue } = useFormContext();

  const [selectedDate, setSelectedDate] = React.useState<string>(
    metadataType === MetadataFieldType.DATETIME && metadataValue
      ? format(new Date(metadataValue), 'dd/MM/yyyy')
      : ''
  );
  const setDate = (date: MaterialUiPickersDate) => {
    if (date && date.toDateString() !== 'Invalid Date') {
      setValue(fieldName, format(date, "yyyy-MM-dd'T'HH:mm:ss"), {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      setValue(fieldName, null, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const defaultText =
    metadataType === MetadataFieldType.ARRAY ? 'item1,item2,...' : 'Value';

  if (metadataType === MetadataFieldType.DATETIME) {
    return (
      <Controller
        control={control}
        name={fieldName}
        defaultValue={
          metadataValue && format(new Date(metadataValue), 'dd/MM/yyyy')
        }
        rules={{ required: 'Invalid date' }}
        render={({ field: { ref }, fieldState }) => (
          <>
            <KeyboardDatePicker
              className={classes.pickerErrorMessage}
              label={labeled ? defaultText : ''}
              disableToolbar
              variant="inline"
              inputVariant="outlined"
              format="dd/MM/yyyy"
              placeholder="DD/MM/YYYY"
              fullWidth
              id="date-picker-inline"
              autoOk
              size={size}
              inputProps={{ ref }}
              inputValue={selectedDate}
              value={selectedDate || null}
              onAccept={date => {
                if (date) setSelectedDate(format(date, 'dd/MM/yyyy'));
                setDate(date);
              }}
              onChange={date => {
                setSelectedDate('');
                setDate(date);
              }}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
            <div className={classes.formErrorContainer}>
              {fieldState.error?.message && (
                <p className={classes.formErrorMessage}>
                  {fieldState.error?.message}
                </p>
              )}
            </div>
          </>
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
            className={classes.radioGroup}
          >
            <Grid container>
              <Grid item sm={6}>
                <FormControlLabel
                  key="new"
                  value="true"
                  control={<Radio />}
                  label="Yes"
                />
              </Grid>
              <Grid item sm={6}>
                <FormControlLabel
                  key="new"
                  value="false"
                  control={<Radio />}
                  label="No"
                />
              </Grid>
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
        <TextField
          {...field}
          size={size}
          fullWidth
          label={labeled ? 'Value' : null}
          placeholder={labeled ? '' : defaultText}
          variant="outlined"
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

export default withStyles(styles)(MetadataValueEditField);
