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
import CancelIcon from 'components/shared/Icons/CancelIcon';
import SearchIcon from 'components/shared/Icons/SearchIcon';
import { SxProps } from '@mui/system';

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
  > {
  size?: TextFieldSizes;

  customStartAdornment?: AdornmentProps;
  customEndAdornment?: AdornmentProps;
}

const AppTextField: React.FC<AppTextFieldProps> = React.forwardRef(
  (
    {
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
                icon={<CancelIcon />}
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
                sx={position || { mr: 5 }}
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
        variant="outlined"
        fullWidth
        InputLabelProps={{ shrink: true }}
        $size={size}
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
        // eslint-disable-next-line react/jsx-no-duplicate-props
        InputProps={{
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
      />
    );
  }
);

export default AppTextField;
