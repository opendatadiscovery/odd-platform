import React, { forwardRef } from 'react';
import { Box, type Theme } from '@mui/material';
import type { SxProps } from '@mui/system';
import { DateTimePicker, type DateTimePickerProps } from '@mui/x-date-pickers';
import { CalendarIcon } from 'components/shared/icons';
import ChevronIcon from 'components/shared/icons/ChevronIcon';
import { dateTimePaperPropsStyles } from './style.overrides';

const dateTimePickerInputFormat = 'd MMM yyyy, HH:mm';

interface AppDateTimePickerProps extends Pick<
  DateTimePickerProps<Date>,
  'onChange' | 'onAccept' | 'label' | 'format' | 'value' | 'minDateTime'
> {
  sx?: SxProps<Theme>;
  errorText?: string;
}

const ChevronLeft = () => <ChevronIcon height={10} transform='rotate(90)' />;
const ChevronRight = () => <ChevronIcon height={10} transform='rotate(-90)' />;

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const AppDateTimePicker: React.FC<AppDateTimePickerProps> = forwardRef(
  ({ onChange, onAccept, label, format, sx, minDateTime, errorText, value }, ref) => (
    <Box sx={sx} width='100%'>
      <DateTimePicker
        ref={ref as unknown as React.Ref<HTMLDivElement>}
        minDateTime={minDateTime}
        onChange={onChange}
        showDaysOutsideCurrentMonth
        ampm={false}
        onAccept={onAccept}
        format={format || dateTimePickerInputFormat}
        label={label}
        value={value}
        dayOfWeekFormatter={date => dayNames[date.getDay()]}
        slots={{
          openPickerIcon: CalendarIcon,
          rightArrowIcon: ChevronRight,
          leftArrowIcon: ChevronLeft,
        }}
        slotProps={{
          openPickerButton: { disableRipple: true, disableTouchRipple: true },
          desktopPaper: dateTimePaperPropsStyles,
          textField: {
            error: !!errorText,
            helperText: errorText,
          },
        }}
      />
    </Box>
  )
);
export default AppDateTimePicker;
