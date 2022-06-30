import React from 'react';
import { SelectProps } from '@mui/material';
import {
  StyledAppSelect,
  AppSelectSizes,
} from 'components/shared/AppSelect/AppSelectStyles';
import DropdownIcon from 'components/shared/Icons/DropdownIcon';

interface AppSelectProps
  extends Pick<
    SelectProps,
    | 'onChange'
    | 'sx'
    | 'value'
    | 'label'
    | 'defaultValue'
    | 'type'
    | 'name'
    | 'fullWidth'
    | 'onSelect'
    | 'id'
    | 'disabled'
    | 'notched'
    | 'placeholder'
  > {
  size?: AppSelectSizes;
  selectNative?: boolean;
  isDataEntityPage?: boolean;
}
const AppSelect: React.FC<AppSelectProps> = ({
  children,
  size = 'medium',
  sx,
  value,
  onChange,
  label,
  defaultValue,
  type,
  fullWidth = true,
  onSelect,
  id,
  disabled,
  placeholder,
  selectNative,
  isDataEntityPage = false,
}) => (
  <StyledAppSelect
    $size={size}
    $isLabeled={!!label}
    $isDataEntityPage={isDataEntityPage}
    variant="outlined"
    fullWidth={fullWidth}
    sx={sx}
    disabled={disabled}
    value={value}
    placeholder={placeholder}
    onChange={onChange}
    label={label}
    defaultValue={defaultValue}
    type={type}
    IconComponent={DropdownIcon}
    native={selectNative}
    onSelect={onSelect}
    id={id}
    notched
    // eslint-disable-next-line react/jsx-no-duplicate-props
  >
    {children}
  </StyledAppSelect>
);

export default AppSelect;
