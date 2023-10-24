import React from 'react';
import { Grid, type SelectProps, type Theme } from '@mui/material';
import { type SxProps } from '@mui/system';
import { DropdownIcon } from 'components/shared/icons';
import type { AppSelectSizes } from 'components/shared/elements/AppSelect/AppSelectStyles';
import * as S from 'components/shared/elements/AppSelect/AppSelectStyles';

interface AppSelectProps extends SelectProps {
  size?: AppSelectSizes;
  containerSx?: SxProps<Theme>;
  maxMenuHeight?: number;
  dataQAId?: string;
}

const AppSelect: React.FC<AppSelectProps> = React.forwardRef(
  (
    { id, size = 'medium', fullWidth = true, label, maxMenuHeight, dataQAId, ...props },
    ref
  ) => (
    <Grid
      sx={props.containerSx || { mt: label ? 2 : 0, width: fullWidth ? '100%' : 'auto' }}
    >
      {label && (
        <S.SelectLabel id={`${id}-label`} htmlFor={id}>
          {label}
        </S.SelectLabel>
      )}
      <S.AppSelect
        {...props}
        $size={size}
        $isLabeled={!!label}
        variant='outlined'
        fullWidth={fullWidth}
        labelId={`${id}-label`}
        IconComponent={DropdownIcon}
        notched
        ref={ref}
        inputProps={{ ...props.inputProps, 'data-qa': dataQAId, id }}
        MenuProps={{
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          transformOrigin: { vertical: 'top', horizontal: 'left' },
          sx: {
            marginTop: '4px',
            maxHeight: maxMenuHeight ? `${maxMenuHeight}px` : 'unset',
          },
        }}
      >
        {props.children}
      </S.AppSelect>
    </Grid>
  )
);

export default AppSelect;
