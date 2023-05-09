import React, { type FC } from 'react';
import { type DatasourceName, DatasourceNames } from 'lib/interfaces';
import styled from 'styled-components';

interface DatasourceLogoProps {
  name: DatasourceName | string;
  width?: number;
  padding?: number;
  rounded?: boolean;
  transparentBackground?: boolean;
}

export const Container = styled('div')<{
  $padding?: number;
  $rounded?: boolean;
  $transparentBackground?: boolean;
}>(({ theme, $padding, $rounded, $transparentBackground }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing($padding ?? 2),
  borderRadius: $rounded ? '50%' : '8px',
  backgroundColor: $transparentBackground
    ? 'transparent'
    : theme.palette.backgrounds.tertiary,
}));

function parseDatasourceName(input: string): DatasourceName {
  const regex = /^\/\/([^/]+)/;
  const match = input.match(regex);
  return match ? (match[1] as DatasourceName) : (input as DatasourceName);
}

const DatasourceLogo: FC<DatasourceLogoProps> = ({
  name,
  width = 48,
  padding,
  rounded,
  transparentBackground,
}) => {
  const parsedName = parseDatasourceName(name);
  const isNameExists = DatasourceNames.includes(parsedName);
  const src = isNameExists ? `/imgs/${parsedName}.png` : `/imgs/default.png`;

  return (
    <Container
      $padding={padding}
      $rounded={rounded}
      $transparentBackground={transparentBackground}
    >
      <img width={width} src={src} alt={`${parsedName} logo`} />
    </Container>
  );
};

export default DatasourceLogo;
