import React from 'react';
import { TextFieldProps } from '@mui/material';
import {
  StyledAppSelect,
  AppSelectSizes,
} from 'components/shared/AppSelect/AppSelectStyles';
import DropdownIcon from 'components/shared/Icons/DropdownIcon';

interface AppSelectProps
  extends Pick<
    TextFieldProps,
    | 'onClick'
    | 'onChange'
    | 'sx'
    | 'value'
    | 'label'
    | 'defaultValue'
    | 'type'
    | 'name'
    | 'fullWidth'
    | 'SelectProps'
    | 'onSelect'
    | 'id'
  > {
  size?: AppSelectSizes;
  selectNative?: boolean;
}
const AppSelect: React.FC<AppSelectProps> = ({
  children,
  size = 'medium',
  onClick,
  sx,
  value,
  onChange,
  label,
  defaultValue,
  type,
  fullWidth = true,
  SelectProps,
  onSelect,
  id,
  selectNative,
}) => (
  <StyledAppSelect
    $size={size}
    $isLabeled={!!label}
    variant="outlined"
    fullWidth={fullWidth}
    sx={sx}
    value={value}
    onChange={onChange}
    onClick={onClick}
    label={label}
    defaultValue={defaultValue}
    type={type}
    select={selectNative}
    SelectProps={{
      ...SelectProps,
      IconComponent: DropdownIcon,
      native: selectNative,
    }}
    onSelect={onSelect}
    id={id}
    // eslint-disable-next-line react/jsx-no-duplicate-props
  >
    {children}
  </StyledAppSelect>
);

export default AppSelect;
