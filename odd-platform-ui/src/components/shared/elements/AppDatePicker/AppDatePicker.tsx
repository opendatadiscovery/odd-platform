import React from 'react';
import { Box, type Theme } from '@mui/material';
import type { SxProps } from '@mui/system';
import { DatePicker, type DatePickerProps } from '@mui/x-date-pickers';
import { CalendarIcon } from 'components/shared/icons';

export const metadataDatePickerInputFormat = 'd MMM yyyy';
export const minDate = new Date(1900, 0, 1);
export const maxDate = new Date(2099, 11, 31);

interface AppDatePickerProps extends Pick<
  DatePickerProps<Date>,
  'onChange' | 'onAccept' | 'label' | 'format'
> {
  sx?: SxProps<Theme>;
  errorText?: string;
  defaultDate?: string;
}

const AppDatePicker: React.FC<AppDatePickerProps> = React.forwardRef(
  (
    { onChange, onAccept, label, format: formatProp, sx, defaultDate, errorText },
    ref
  ) => {
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

    React.useEffect(() => {
      if (defaultDate) {
        setSelectedDate(new Date(defaultDate));
      }
    }, [defaultDate]);

    const AppDatePickerIcon = React.useCallback(() => <CalendarIcon />, [CalendarIcon]);

    return (
      <Box sx={sx} width='100%'>
        <DatePicker
          ref={ref as unknown as React.Ref<HTMLDivElement>}
          minDate={minDate}
          maxDate={maxDate}
          onChange={(date, context) => {
            setSelectedDate(date);
            if (onChange) onChange(date, context);
          }}
          onAccept={(date, context) => {
            setSelectedDate(date);
            if (onAccept) onAccept(date, context);
          }}
          format={formatProp ?? metadataDatePickerInputFormat}
          label={label}
          value={selectedDate}
          slots={{
            openPickerIcon: AppDatePickerIcon,
          }}
          slotProps={{
            openPickerButton: { disableRipple: true },
            textField: {
              error: !!errorText,
              helperText: errorText,
            },
          }}
        />
      </Box>
    );
  }
);
export default AppDatePicker;
