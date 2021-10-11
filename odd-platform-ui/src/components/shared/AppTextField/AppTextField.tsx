import React from 'react';
import { CircularProgress, Grid, TextFieldProps } from '@mui/material';
import {
  StyledAppTextField,
  TextFieldSizes,
} from 'components/shared/AppTextField/AppTextFieldStyles';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import CancelIcon from 'components/shared/Icons/CancelIcon';
import SearchIcon from 'components/shared/Icons/SearchIcon';

interface AppTextFieldProps
  extends Pick<
    TextFieldProps,
    | 'onClick'
    | 'onChange'
    | 'onKeyDown'
    | 'sx'
    | 'fullWidth'
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
  > {
  size?: TextFieldSizes;
  defaultStartAdornmentCondition?: boolean;
  defaultStartAdornmentOnClick?: () => void;
  defaultEndAdornmentCondition?: boolean;
  defaultEndAdornmentOnClick?: () => void;
  loaderCondition?: boolean;
}

const AppTextField: React.FC<AppTextFieldProps> = React.forwardRef(
  (
    {
      size = 'medium',
      onClick,
      sx,
      fullWidth,
      placeholder,
      InputProps,
      value,
      onChange,
      disabled,
      error,
      helperText,
      defaultStartAdornmentCondition = false,
      defaultStartAdornmentOnClick,
      defaultEndAdornmentCondition = false,
      defaultEndAdornmentOnClick,
      label,
      defaultValue,
      onKeyDown,
      inputProps,
      loaderCondition,
    },
    ref
  ) => {
    const defaultStartAdornment = (
      <AppIconButton
        sx={{ ml: 1 }}
        size="small"
        color="unfilled"
        icon={<SearchIcon />}
        disabled={disabled}
        onClick={defaultStartAdornmentOnClick}
      />
    );
    const defaultEndAdornment = (
      <Grid
        container
        justifyContent="space-between"
        width="auto"
        alignItems="center"
        wrap="nowrap"
      >
        {loaderCondition && <CircularProgress color="inherit" size={20} />}
        <AppIconButton
          sx={{ mx: 1 }}
          size="small"
          color="unfilled"
          icon={<CancelIcon />}
          disabled={disabled}
          onClick={defaultEndAdornmentOnClick}
        />
      </Grid>
    );

    return (
      <StyledAppTextField
        variant="outlined"
        $size={size}
        onClick={onClick}
        sx={sx}
        fullWidth={fullWidth}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        error={error}
        helperText={helperText}
        label={label}
        defaultValue={defaultValue}
        onKeyDown={onKeyDown}
        ref={ref}
        inputProps={inputProps}
        // eslint-disable-next-line react/jsx-no-duplicate-props
        InputProps={
          defaultStartAdornmentCondition || defaultEndAdornmentCondition
            ? {
                startAdornment:
                  defaultStartAdornmentCondition && defaultStartAdornment,
                endAdornment:
                  defaultEndAdornmentCondition && defaultEndAdornment,
              }
            : InputProps
        }
      />
    );
  }
);

export default AppTextField;
