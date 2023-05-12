import React, { type ChangeEvent, type FC, useCallback, useRef } from 'react';
import { ClearIcon } from 'components/shared/icons';
import Button from 'components/shared/elements/Button/Button';
import type { InputSize, InputType, InputVariant } from './interfaces';
import * as S from './Input.styles';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant: InputVariant;
  label?: string;
  hint?: string;
  maxWidth?: number;
  error?: string;
  handleCleanUp?: () => void;
}

const Input: FC<InputProps> = ({
  variant,
  label,
  hint,
  type = 'text',
  maxWidth,
  error,
  handleCleanUp,
  onChange,
  value,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputType, inputSize] = variant.split('-') as [InputType, InputSize];

  const handleCleanUpClick = useCallback(() => {
    onChange?.({ target: { value: '' } } as ChangeEvent<HTMLInputElement>);
    inputRef.current?.focus();

    handleCleanUp?.();
  }, [handleCleanUp, onChange]);

  return (
    <S.Container $maxWidth={maxWidth}>
      {label && <S.Label>{label}</S.Label>}
      <div style={{ position: 'relative' }}>
        <S.Input
          ref={inputRef}
          $isError={!!error}
          $type={inputType}
          $size={inputSize}
          type={type}
          value={value}
          onChange={onChange}
          {...props}
        />
        <S.EndAdornment>
          {value && (
            <Button
              buttonType='linkGray-m'
              onClick={handleCleanUpClick}
              icon={<ClearIcon />}
            />
          )}
        </S.EndAdornment>
      </div>

      {hint && <S.Hint>{hint}</S.Hint>}
      {error && <S.Error>{error}</S.Error>}
    </S.Container>
  );
};

export default Input;
