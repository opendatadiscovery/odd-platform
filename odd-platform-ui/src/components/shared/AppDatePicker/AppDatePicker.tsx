import React from 'react';
import { Box, Theme } from '@mui/material';
import { SxProps } from '@mui/system';
import { AppInput } from 'components/shared';
import { CalendarIcon } from 'components/shared/Icons';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers';

export const metadataDatePickerInputFormat = 'd MMM yyyy';
export const metadataBackendDateFormat = "yyyy-MM-dd'T'HH:mm:ss";
export const minDate = new Date(1900, 0, 1);
export const maxDate = new Date(2099, 11, 31);

interface AppDatePickerProps
  extends Pick<
    DatePickerProps<Date, Date>,
    'onChange' | 'onAccept' | 'label' | 'inputFormat' | 'disableMaskedInput'
  > {
  sx?: SxProps<Theme>;
  showInputError?: boolean;
  inputHelperText?: string;
  defaultDate: string;
}

const AppDatePicker: React.FC<AppDatePickerProps> = React.forwardRef(
  (
    {
      onChange,
      onAccept,
      label,
      inputFormat,
      disableMaskedInput,
      sx,
      showInputError,
      inputHelperText,
      defaultDate,
    },
    ref
  ) => {
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

    React.useEffect(() => setSelectedDate(new Date(defaultDate)), [defaultDate]);

    const AppDatePickerIcon = React.useCallback(() => <CalendarIcon />, [CalendarIcon]);

    return (
      <Box sx={sx} width='100%'>
        <DatePicker
          ref={ref as unknown as React.Ref<HTMLDivElement>}
          minDate={minDate}
          maxDate={maxDate}
          onChange={date => {
            setSelectedDate(date);
            onChange(date);
            return onChange;
          }}
          onAccept={date => {
            setSelectedDate(date);
            return onAccept;
          }}
          inputFormat={inputFormat || metadataDatePickerInputFormat}
          disableMaskedInput={disableMaskedInput}
          label={label}
          value={selectedDate}
          components={{
            OpenPickerIcon: AppDatePickerIcon,
          }}
          renderInput={params => (
            <AppInput
              {...params}
              ref={params.inputRef}
              type='date'
              error={showInputError}
              helperText={inputHelperText}
            />
          )}
        />
      </Box>
    );
  }
);
export default AppDatePicker;
