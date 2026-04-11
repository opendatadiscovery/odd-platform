import React from 'react';
import type { InputBaseComponentProps, RadioProps } from '@mui/material';
import * as S from 'components/shared/elements/AppRadio/AppRadioStyles';

type AppRadioProps = RadioProps & { dataQAId?: string };

const AppRadio: React.FC<AppRadioProps> = ({ dataQAId, ...props }) => (
  <S.StyledRadio
    {...props}
    inputProps={{ ...props.inputProps, 'data-qa': dataQAId } as InputBaseComponentProps}
    disableRipple
    icon={<S.Icon />}
    checkedIcon={<S.IconChecked />}
  />
);

export default AppRadio;
