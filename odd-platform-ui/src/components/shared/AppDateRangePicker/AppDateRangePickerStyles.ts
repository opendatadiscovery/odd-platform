import styled from 'styled-components';
import { DateRangePicker, DateRangePickerProps } from 'rsuite';
import 'rsuite/dist/rsuite.css';

export const AppDateRangePicker = styled(
  DateRangePicker
)<DateRangePickerProps>(({ theme }) => ({
  '&.rs-picker': {
    '& .rs-picker-toggle': {
      borderColor: theme.palette.textField.normal.border,
      borderRadius: '4px',
      boxShadow: 'none',

      '&.rs-picker-toggle:hover': {
        borderColor: theme.palette.textField.hover.border,
      },

      '& .rs-picker-toggle-value': {
        color: theme.palette.texts.primary,
      },

      '& .rs-picker-toggle-textbox': {
        color: theme.palette.texts.primary,
      },
    },
  },
  '&.rs-picker-toggle-wrapper': {
    width: '100%',
  },
}));

export const DateRangePickerLabel = styled('div')(({ theme }) => ({
  fontFamily: 'Roboto,Helvetica,Arial,sans-serif',
  color: theme.palette.texts.secondary,
  fontWeight: theme.typography.h5.fontWeight,
  fontSize: theme.typography.h5.fontSize,
  lineHeight: theme.typography.h5.lineHeight,
}));
