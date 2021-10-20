import React from 'react';
import {
  CircularProgress,
  Grid,
  TextFieldProps,
  Theme,
} from '@mui/material';
import {
  StyledAppTextField,
  TextFieldSizes,
} from 'components/shared/AppTextField/AppTextFieldStyles';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import SearchIcon from 'components/shared/Icons/SearchIcon';
import { SxProps } from '@mui/system';
import DropdownIcon from 'components/shared/Icons/DropdownIcon';

type AdornmentVariant = 'loader' | 'clear' | 'search';
interface AdornmentProps {
  variant: AdornmentVariant;
  isShow: boolean;
  onCLick?: () => void;
  sx?: SxProps<Theme>;
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
    const adornment = (
      variant?: AdornmentVariant,
      isShow?: boolean,
      onCLick?: () => void,
      position?: SxProps<Theme>
    ) => {
      switch (variant) {
        case 'clear':
          return (
            isShow && (
              <AppIconButton
                sx={position || { mx: 1 }}
                size="small"
                color="unfilled"
                icon={<ClearIcon />}
                disabled={disabled}
                onClick={onCLick}
              />
            )
          );
        case 'search':
          return (
            isShow && (
              <AppIconButton
                sx={position || { mx: 1 }}
                size="small"
                color="unfilled"
                icon={<SearchIcon />}
                disabled={disabled}
                onClick={onCLick}
              />
            )
          );
        case 'loader':
          return (
            isShow && (
              <Grid
                container
                alignItems="center"
                justifyContent="flex-end"
                width="max-content"
                sx={position}
              >
                <CircularProgress color="inherit" size={20} />
              </Grid>
            )
          );
        default:
          return null;
      }
    };

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
              {adornment(
                customStartAdornment?.variant,
                customStartAdornment?.isShow,
                customStartAdornment?.onCLick,
                customStartAdornment?.sx
              )}
            </>
          ),
          endAdornment: (
            <>
              {adornment(
                customEndAdornment?.variant,
                customEndAdornment?.isShow,
                customEndAdornment?.onCLick,
                customEndAdornment?.sx
              )}
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
