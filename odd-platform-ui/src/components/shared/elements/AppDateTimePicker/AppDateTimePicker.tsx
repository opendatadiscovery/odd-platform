import React, { forwardRef } from 'react';
import { Box, type Theme } from '@mui/material';
import type { SxProps } from '@mui/system';
import { CalendarIcon } from 'components/shared/icons';
import { DateTimePicker, type DateTimePickerProps } from '@mui/x-date-pickers';
import Input from 'components/shared/elements/Input/Input';
import ChevronIcon from 'components/shared/icons/ChevronIcon';
import { dateTimePaperPropsStyles } from './style.overrides';

const dateTimePickerInputFormat = 'd MMM yyyy, HH:mm';

interface AppDateTimePickerProps
  extends Pick<
    DateTimePickerProps<Date, Date>,
    | 'onChange'
    | 'onAccept'
    | 'label'
    | 'inputFormat'
    | 'disableMaskedInput'
    | 'value'
    | 'minDateTime'
  > {
  sx?: SxProps<Theme>;
  errorText?: string;
}

const ChevronLeft = () => <ChevronIcon height={10} transform='rotate(90)' />;
const ChevronRight = () => <ChevronIcon height={10} transform='rotate(-90)' />;

const weekDayNameMap: Record<string, string> = {
  Su: 'Sun',
  Mo: 'Mon',
  Tu: 'Tue',
  We: 'Wed',
  Th: 'Thu',
  Fr: 'Fri',
  Sa: 'Sat',
};

const AppDateTimePicker: React.FC<AppDateTimePickerProps> = forwardRef(
  (
    {
      onChange,
      onAccept,
      label,
      inputFormat,
      disableMaskedInput,
      sx,
      minDateTime,
      errorText,
      value,
    },
    ref
  ) => (
    <Box sx={sx} width='100%'>
      <DateTimePicker
        ref={ref as unknown as React.Ref<HTMLDivElement>}
        minDateTime={minDateTime}
        onChange={date => {
          onChange(date);
          return onChange;
        }}
        showDaysOutsideCurrentMonth
        ampm={false}
        onAccept={onAccept}
        inputFormat={inputFormat || dateTimePickerInputFormat}
        disableMaskedInput={disableMaskedInput}
        label={label}
        value={value}
        dayOfWeekFormatter={day => weekDayNameMap[day]}
        components={{
          OpenPickerIcon: CalendarIcon,
          RightArrowIcon: ChevronRight,
          LeftArrowIcon: ChevronLeft,
        }}
        OpenPickerButtonProps={{ disableRipple: true, disableTouchRipple: true }}
        PaperProps={dateTimePaperPropsStyles}
        renderInput={params => (
          <Input
            variant='main-m'
            inputProps={params.inputProps}
            ref={params.inputRef}
            type='date'
            error={errorText}
            calendar={params.InputProps?.endAdornment}
          />
        )}
      />
    </Box>
  )
);
export default AppDateTimePicker;
