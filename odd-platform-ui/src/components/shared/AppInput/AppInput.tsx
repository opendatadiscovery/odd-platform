import React from 'react';
import { CircularProgress, TextFieldProps, Theme } from '@mui/material';
import {
  StyledAppInput,
  AppInputSizes,
} from 'components/shared/AppInput/AppInputStyles';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import { SxProps } from '@mui/system';

type AdornmentVariant = 'loader' | 'clear' | 'search';
interface AdornmentProps {
  variant: AdornmentVariant;
  showAdornment: boolean;
  icon?: React.ReactNode;
  onCLick?: (e: React.MouseEvent) => void;
  position?: SxProps<Theme>;
}

interface AppInputProps
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
    | 'minRows'
    | 'select'
  > {
  size?: AppInputSizes;
  selectNative?: boolean;
  customStartAdornment?: AdornmentProps;
  customEndAdornment?: AdornmentProps;
}

const AppInput: React.FC<AppInputProps> = React.forwardRef(
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
      select,
      fullWidth = true,
      minRows,
      selectNative,
    },
    ref
  ) => {
    const buildAdornment = ({
      icon,
      variant,
      showAdornment,
      onCLick,
      position,
    }: AdornmentProps) => {
      if (!showAdornment) {
        return undefined;
      }

      if (variant === 'loader') {
        return (
          <CircularProgress sx={position} color="inherit" size={20} />
        );
      }

      return (
        <AppIconButton
          sx={position || { mx: 1 }}
          size="small"
          color="unfilled"
          icon={icon}
          disabled={disabled}
          onClick={onCLick}
        />
      );
    };

    return (
      <StyledAppInput
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
        select={select || selectNative}
        maxRows={maxRows}
        minRows={minRows}
        multiline={multiline}
        name={name}
        // eslint-disable-next-line react/jsx-no-duplicate-props
        InputProps={{
          ...InputProps,
          startAdornment: (
            <>
              {customStartAdornment &&
                buildAdornment(customStartAdornment)}
            </>
          ),
          endAdornment: (
            <>
              {customEndAdornment && buildAdornment(customEndAdornment)}
              {InputProps?.endAdornment}
            </>
          ),
        }}
      >
        {children}
      </StyledAppInput>
    );
  }
);

export default AppInput;
