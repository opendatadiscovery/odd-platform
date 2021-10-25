import React from 'react';
import { CircularProgress, TextFieldProps, Theme } from '@mui/material';
import {
  StyledAppTextField,
  TextFieldSizes,
} from 'components/shared/AppTextField/AppTextFieldStyles';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import { SxProps } from '@mui/system';
import DropdownIcon from 'components/shared/Icons/DropdownIcon';

type AdornmentVariant = 'loader' | 'clear' | 'search';
interface AdornmentProps {
  variant: AdornmentVariant;
  showAdornment: boolean;
  icon?: React.ReactNode;
  onCLick?: () => void;
  position?: SxProps<Theme>;
}

interface AppTextFieldProps
  extends Pick<
    TextFieldProps,
    | 'onClick'
    | 'onChange'
    | 'onKeyDown'
    | 'sx'
    | 'placeholder'
    | 'InputProps'
    | 'value'
    | 'disabled'
    | 'error'
    | 'helperText'
    | 'label'
    | 'defaultValue'
    | 'ref'
    | 'inputProps'
    | 'required'
    | 'type'
    | 'maxRows'
    | 'multiline'
    | 'name'
    | 'fullWidth'
    | 'select'
    | 'SelectProps'
    | 'onSelect'
    | 'id'
  > {
  size?: TextFieldSizes;

  customStartAdornment?: AdornmentProps;
  customEndAdornment?: AdornmentProps;
  selectNative?: boolean;
}

const AppTextField: React.FC<AppTextFieldProps> = React.forwardRef(
  (
    {
      children,
      size = 'medium',
      onClick,
      sx,
      placeholder,
      InputProps,
      value,
      onChange,
      disabled,
      error,
      helperText,
      label,
      defaultValue,
      onKeyDown,
      inputProps,
      required,
      type,
      customStartAdornment,
      customEndAdornment,
      maxRows,
      multiline,
      name,
      fullWidth = true,
      select,
      SelectProps,
      onSelect,
      id,
      selectNative,
    },
    ref
  ) => {
    const setAdornment = ({
      icon,
      variant,
      showAdornment,
      onCLick,
      position,
    }: AdornmentProps) =>
      variant === 'loader'
        ? showAdornment && (
            <CircularProgress sx={position} color="inherit" size={20} />
          )
        : showAdornment && (
            <AppIconButton
              sx={position || { mx: 1 }}
              size="small"
              color="unfilled"
              icon={icon}
              disabled={disabled}
              onClick={onCLick}
            />
          );

    return (
      <StyledAppTextField
        $size={size}
        $isLabeled={!!label}
        variant="outlined"
        fullWidth={fullWidth}
        InputLabelProps={{ shrink: true }}
        sx={sx}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onClick={onClick}
        disabled={disabled}
        error={error}
        helperText={helperText}
        label={label}
        defaultValue={defaultValue}
        onKeyDown={onKeyDown}
        ref={ref}
        inputProps={inputProps}
        required={required}
        type={type}
        maxRows={maxRows}
        multiline={multiline}
        name={name}
        select={select || selectNative}
        SelectProps={{
          ...SelectProps,
          IconComponent: DropdownIcon,
          native: selectNative,
        }}
        onSelect={onSelect}
        id={id}
        // eslint-disable-next-line react/jsx-no-duplicate-props
        InputProps={{
          ...InputProps,
          startAdornment: (
            <>
              {customStartAdornment && setAdornment(customStartAdornment)}
            </>
          ),
          endAdornment: (
            <>
              {customEndAdornment && setAdornment(customEndAdornment)}
              {InputProps?.endAdornment}
            </>
          ),
        }}
      >
        {children}
      </StyledAppTextField>
    );
  }
);

export default AppTextField;
