import styled from 'styled-components';
import InputIcon from 'react-multi-date-picker/components/input_icon';
import { breakpointDownLgBody2, pxToRem } from 'theme/typography';
import 'components/shared/elements/AppDateRangePicker/overrides.css';

export const AppDateRangeInputIcon = styled(InputIcon)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(0.75, 1),
  color: theme.palette.texts.primary,
  fontWeight: 400,
  fontSize: pxToRem(14),
  lineHeight: pxToRem(20),
  border: '1px solid',
  borderColor: theme.palette.textField.normal.border,
  borderRadius: '4px',
  ...breakpointDownLgBody2,
  '&:hover': {
    borderColor: theme.palette.textField.hover.border,
  },
  '&:focus, &:active': {
    borderColor: theme.palette.textField.active.border,
  },
  '& + svg': {
    right: '8px !important',
    stroke: theme.palette.texts.secondary,
  },
}));

export const DateRangePickerLabel = styled('div')(({ theme }) => ({
  color: theme.palette.texts.secondary,
  fontWeight: theme.typography.h5.fontWeight,
  fontSize: theme.typography.h5.fontSize,
  lineHeight: theme.typography.h5.lineHeight,
}));
