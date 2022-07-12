import { Variant } from '@mui/material/styles/createTypography';
import { Typography } from '@mui/material';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import React from 'react';
import { ActivityEventType } from 'generated-sources';
import * as S from './OwnerWithRoleStyles';

export interface OwnerWithRoleProps {
  ownerName?: string;
  roleName?: string;
  isChanged?: boolean;
  ownerTypographyVariant?: Variant;
  eventType?: ActivityEventType;
}

const OwnerWithRole: React.FC<OwnerWithRoleProps> = ({
  ownerName,
  roleName,
  isChanged,
  ownerTypographyVariant = 'body1',
  eventType,
}) => (
  <S.Container container $eventType={eventType} $isChanged={isChanged}>
    <Typography variant={ownerTypographyVariant} sx={{ mr: 0.5 }}>
      {ownerName}
    </Typography>
    <LabelItem labelName={roleName} />
  </S.Container>
);

export default OwnerWithRole;
