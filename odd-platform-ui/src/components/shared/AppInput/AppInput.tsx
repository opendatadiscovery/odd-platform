import React from 'react';
import { CircularProgress, TextFieldProps, Theme } from '@mui/material';
import { AppInputSizes, StyledAppInput } from 'components/shared/AppInput/AppInputStyles';
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

export interface AppInputProps
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
    | 'onFocus'
  > {
  size?: AppInputSizes;
  customStartAdornment?: AdornmentProps;
  customEndAdornment?: AdornmentProps;
}

const AppInput: React.FC<AppInputProps> = React.forwardRef(
  (
    {
      size = 'medium',
      customStartAdornment,
      customEndAdornment,
      fullWidth = true,
      ...props
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
        return <CircularProgress sx={position} color='inherit' size={20} />;
      }

      return (
        <AppIconButton
          sx={position || { mx: 1 }}
          size='small'
          color='unfilled'
          icon={icon}
          disabled={props.disabled}
          onClick={onCLick}
        />
      );
    };

    return (
      <StyledAppInput
        {...props}
        $size={size}
        $isLabeled={!!props.label}
        variant='outlined'
        fullWidth={fullWidth}
        InputLabelProps={{ shrink: true }}
        ref={ref}
        // eslint-disable-next-line react/jsx-no-duplicate-props
        InputProps={{
          ...props.InputProps,
          startAdornment: (
            <>{customStartAdornment && buildAdornment(customStartAdornment)}</>
          ),
          endAdornment: (
            <>
              {customEndAdornment && buildAdornment(customEndAdornment)}
              {props.InputProps?.endAdornment}
            </>
          ),
        }}
      >
        {props.children}
      </StyledAppInput>
    );
  }
);

export default AppInput;
