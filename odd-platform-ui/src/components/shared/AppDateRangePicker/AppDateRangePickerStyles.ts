import styled from 'styled-components';
// import { DateRangePicker } from 'react-date-range';
// import { DateRangePicker, DateRangePickerProps } from 'rsuite';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.css';
// import 'rsuite/dist/rsuite.min.css';
import { PickerBaseProps } from 'rsuite/esm/@types/common';
// import 'rsuite/DateRangePicker/styles/index.less';

export const AppDateRangePicker = styled(DateRangePicker)<PickerBaseProps>(
  ({ theme }) => ({
    // [`${PickerBaseProps}`]: { border: '1px solid red' },
    '& .rs-btn': {
      border: '1px solid red',
    },

    '&.placement-bottom-start': {
      border: '1px solid red',
    },

    '&.rs-picker-daterange-menu': {
      border: '1px solid red',
    },

    '&.rs-picker-daterange-header': { display: 'none' },

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

      // '& .rs-picker-toggle:hover': {
      //   borderColor: 'red',
      // },
    },
    '&.rs-picker-toggle-wrapper': {
      width: '100%',
    },
  })
);

export const DateRangePickerLabel = styled('div')(({ theme }) => ({
  fontFamily: 'Roboto,Helvetica,Arial,sans-serif',
  color: theme.palette.texts.secondary,
  fontWeight: theme.typography.h5.fontWeight,
  fontSize: theme.typography.h5.fontSize,
  lineHeight: theme.typography.h5.lineHeight,

  // transform: 'none',
  // border: 'none',
  // outline: 'none !important',
  // top: theme.spacing(-0.25),
}));

export const DateRangePickerMenuStyles = {
  '& .rs-picker-daterange-panel': {
    border: '1px solid red',
  },
};
