import React, { type FC } from 'react';
import { IntegrationIds, type IntegrationId } from 'lib/interfaces';
import styled from 'styled-components';

interface IntegrationIconProps {
  id: IntegrationId;
  width?: number;
}

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  borderRadius: '8px',
  backgroundColor: theme.palette.backgrounds.tertiary,
}));

const IntegrationLogo: FC<IntegrationIconProps> = ({ id, width = 48 }) => {
  const isIdExists = IntegrationIds.includes(id);
  const src = isIdExists ? `/imgs/${id}.png` : `/imgs/default.png`;

  return (
    <Container>
      <img width={width} src={src} alt={`${id} logo`} />
    </Container>
  );
};

export default IntegrationLogo;
