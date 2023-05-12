import React, { type ChangeEvent, type FC, useCallback, useRef } from 'react';
import { ClearIcon, SearchIcon } from 'components/shared/icons';
import Button from 'components/shared/elements/Button/Button';
import AppCircularProgress from 'components/shared/elements/AppCircularProgress/AppCircularProgress';
import type { InputSize, InputType, InputVariant } from './interfaces';
import * as S from './Input.styles';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant: InputVariant;
  label?: string;
  hint?: string;
  maxWidth?: number;
  error?: string;
  isLoading?: boolean;
  handleCleanUp?: () => void;
  handleSearchClick?: () => void;
}

const Input: FC<InputProps> = ({
  variant,
  type = 'text',
  maxWidth,
  handleCleanUp,
  isLoading,
  handleSearchClick,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputType, inputSize] = variant.split('-') as [InputType, InputSize];

  const handleCleanUpClick = useCallback(() => {
    props.onChange?.({ target: { value: '' } } as ChangeEvent<HTMLInputElement>);
    inputRef.current?.focus();

    handleCleanUp?.();
  }, [handleCleanUp, props.onChange]);

  return (
    <S.Container $maxWidth={maxWidth}>
      {props.label && <S.Label>{props.label}</S.Label>}
      <div style={{ position: 'relative' }}>
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
          ref={inputRef}
          $isError={!!props.error}
          $type={inputType}
          $size={inputSize}
          type={type}
          {...props}
        />
        <S.Adornment>
          {isLoading && <AppCircularProgress size={16} background='transparent' />}
          {props.value && (
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
};

export default Input;
