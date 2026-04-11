import React from 'react';
import { type Variant } from '@mui/material/styles/createTypography';
import { Typography } from '@mui/material';
import { type EventType } from 'lib/interfaces';
import LabelItem from 'components/shared/elements/LabelItem/LabelItem';
import * as S from 'components/shared/elements/Activity/ActivityFields/OwnerActivityField/OwnerWithTitle/OwnerWithTitleStyles';

export interface OwnerWithRoleProps {
  ownerName?: string;
  roleName?: string;
  ownerTypographyVariant?: Variant;
  typeOfChange?: EventType;
}

const OwnerWithTitle: React.FC<OwnerWithRoleProps> = ({
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

export default OwnerWithTitle;
