import React, { type ChangeEvent, forwardRef, useCallback } from 'react';
import { ClearIcon, SearchIcon } from 'components/shared/icons';
import Button from 'components/shared/elements/Button/Button';
import AppCircularProgress from 'components/shared/elements/AppCircularProgress/AppCircularProgress';
import type { SxProps, Theme } from '@mui/system';
import { Box } from '@mui/material';
import type { InputSize, InputType, InputVariant } from './interfaces';
import * as S from './Input.styles';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant: InputVariant | undefined;
  label?: string;
  hint?: string;
  maxWidth?: number;
  error?: string;
  isLoading?: boolean;
  handleCleanUp?: () => void;
  handleSearchClick?: () => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  inputContainerRef?: React.Ref<any>;
  sx?: SxProps<Theme>;

  calendar?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'main-m',
      type = 'text',
      maxWidth,
      handleCleanUp,
      isLoading,
      handleSearchClick,
      sx,
      ...props
    },
    ref
  ) => {
    const [inputType, inputSize] = variant.split('-') as [InputType, InputSize];

    const handleCleanUpClick = useCallback(() => {
      const emptyValue = { target: { value: '' } } as ChangeEvent<HTMLInputElement>;

      props.onChange?.(emptyValue);
      props.inputProps?.onChange?.(emptyValue);

      handleCleanUp?.();
    }, [handleCleanUp, props.onChange, props.inputProps?.onChange]);

    return (
      <S.Container $maxWidth={maxWidth} sx={sx}>
        {props.label && <S.Label>{props.label}</S.Label>}
        <div style={{ position: 'relative' }} ref={props.inputContainerRef}>
          {inputType === 'search' && (
            <S.Adornment $isStart>
              <Button
                buttonType='linkGray-m'
                onClick={handleSearchClick}
                icon={<SearchIcon />}
              />
            </S.Adornment>
          )}
          <S.Input
            ref={ref}
            $isError={!!props.error}
            $type={inputType}
            $size={inputSize}
            type={type}
            {...props}
            {...props.inputProps}
          />
          <S.Adornment>
            {props.calendar && <Box sx={{ mr: 1 }}>{props.calendar}</Box>}
            {isLoading && <AppCircularProgress size={16} background='transparent' />}
            {(props.value || props.inputProps?.value) && (
              <Button
                buttonType='linkGray-m'
                onClick={handleCleanUpClick}
                icon={<ClearIcon />}
              />
            )}
          </S.Adornment>
        </div>

        {props.hint && <S.Hint>{props.hint}</S.Hint>}
        {props.error && <S.Hint $isError>{props.error}</S.Hint>}
      </S.Container>
    );
  }
);

export default Input;
