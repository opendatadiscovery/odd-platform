import React from 'react';
import { Grid, SelectProps, Theme } from '@mui/material';
import DropdownIcon from 'components/shared/Icons/DropdownIcon';
import { SxProps } from '@mui/system';
import type { AppSelectSizes } from './AppSelectStyles';
import * as S from './AppSelectStyles';

interface AppSelectProps
  extends Pick<
    SelectProps,
    | 'onChange'
    | 'sx'
    | 'value'
    | 'label'
    | 'defaultValue'
    | 'type'
    | 'name'
    | 'fullWidth'
    | 'onSelect'
    | 'id'
    | 'disabled'
    | 'notched'
    | 'placeholder'
    | 'native'
  > {
  size?: AppSelectSizes;
  containerSx?: SxProps<Theme>;
}

const AppSelect: React.FC<AppSelectProps> = ({
  size = 'medium',
  fullWidth = true,
  ...props
}) => (
  <Grid
    sx={
      props.containerSx || {
        mt: props.label ? 2 : 0,
        width: fullWidth ? '100%' : 'auto',
      }
    }
  >
    {props.label && (
      <S.SelectLabel id="select-label-id">{props.label}</S.SelectLabel>
    )}
    <S.AppSelect
      {...props}
      $size={size}
      variant="outlined"
      fullWidth={fullWidth}
      labelId="select-label-id"
      IconComponent={DropdownIcon}
      notched
    >
      {props.children}
    </S.AppSelect>
  </Grid>
);

export default AppSelect;
