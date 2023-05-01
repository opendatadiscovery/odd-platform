import React from 'react';
import type { TextFieldProps } from '@mui/material';
import { CircularProgress } from '@mui/material';
import type { AppInputSizes } from 'components/shared/elements/AppInput/AppInputStyles';
import { StyledAppInput } from 'components/shared/elements/AppInput/AppInputStyles';
import type { SxProps, Theme } from '@mui/system';
import Button from 'components/shared/elements/Button/Button';

type AdornmentVariant = 'loader' | 'clear' | 'search';

interface AdornmentProps {
  variant: AdornmentVariant;
  showAdornment: boolean;
  icon?: React.ReactNode;
  onCLick?: (e: React.MouseEvent) => void;
  position?: SxProps<Theme>;
}

export interface AppInputProps
  extends React.PropsWithChildren,
    Pick<
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
  dataQAId?: string;
}

const AppInput: React.FC<AppInputProps> = React.forwardRef(
  (
    {
      size = 'medium',
      customStartAdornment,
      customEndAdornment,
      fullWidth = true,
      dataQAId,
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
        <Button
          buttonType='linkGray-m'
          icon={icon}
          sx={position || { mx: 1 }}
          disabled={props.disabled}
          onClick={onCLick}
        />
      );
    };

    return (
      <StyledAppInput
        {...props}
        data-qa='input'
        $size={size}
        $isLabeled={!!props.label}
        variant='outlined'
        fullWidth={fullWidth}
        InputLabelProps={{ shrink: true }}
        inputRef={ref}
        inputProps={{ ...props.inputProps, 'data-qa': dataQAId }}
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
