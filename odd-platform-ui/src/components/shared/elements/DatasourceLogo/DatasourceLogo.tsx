import React, { type FC } from 'react';
import { type DatasourceName, DatasourceNames } from 'lib/interfaces';
import styled from 'styled-components';
import { parseDatasourceName } from './helpers';

type BackgroundColor = 'tertiary' | 'default' | 'transparent';

interface DatasourceLogoProps {
  name: DatasourceName | string;
  width?: number;
  padding?: number;
  rounded?: boolean;
  backgroundColor?: BackgroundColor;
}

export const Container = styled('div')<{
  $padding?: number;
  $rounded?: boolean;
  $backgroundColor: BackgroundColor;
}>(({ theme, $padding, $rounded, $backgroundColor }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing($padding ?? 2),
  borderRadius: $rounded ? '50%' : '8px',
  backgroundColor: theme.palette.backgrounds[$backgroundColor],
}));

const DatasourceLogo: FC<DatasourceLogoProps> = ({
  name,
  width = 48,
  padding,
  rounded,
  backgroundColor = 'tertiary',
}) => {
  const parsedName = parseDatasourceName(name);
  const isNameExists = DatasourceNames.includes(parsedName);
  const src = isNameExists ? `/imgs/${parsedName}.png` : `/imgs/default.png`;

  return (
    <Container $padding={padding} $rounded={rounded} $backgroundColor={backgroundColor}>
      <img width={width} src={src} alt={`${parsedName} logo`} />
    </Container>
  );
};

export default DatasourceLogo;
