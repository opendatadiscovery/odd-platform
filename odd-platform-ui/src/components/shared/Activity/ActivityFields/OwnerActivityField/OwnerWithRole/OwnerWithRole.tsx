import { Variant } from '@mui/material/styles/createTypography';
import { Typography } from '@mui/material';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import React from 'react';
import { CRUDType } from 'lib/interfaces';
import * as S from './OwnerWithRoleStyles';

export interface OwnerWithRoleProps {
  ownerName?: string;
  roleName?: string;
  ownerTypographyVariant?: Variant;
  typeOfChange?: CRUDType;
}

const OwnerWithRole: React.FC<OwnerWithRoleProps> = ({
  ownerName,
  roleName,
  ownerTypographyVariant = 'body1',
  typeOfChange,
}) => (
  <S.Container container $typeOfChange={typeOfChange}>
    <Typography variant={ownerTypographyVariant} sx={{ mr: 0.5 }}>
      {ownerName}
    </Typography>
    <LabelItem labelName={roleName} />
  </S.Container>
);

export default OwnerWithRole;
