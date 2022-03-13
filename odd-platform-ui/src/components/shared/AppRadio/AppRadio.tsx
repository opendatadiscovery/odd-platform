import React from 'react';
import { RadioProps } from '@mui/material';
import * as S from './AppRadioStyles';

type AppRadioProps = RadioProps;

const AppRadio: React.FC<AppRadioProps> = props => (
  <S.StyledRadio
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    disableRipple
    icon={<S.Icon />}
    checkedIcon={<S.IconChecked />}
  />
);

export default AppRadio;
