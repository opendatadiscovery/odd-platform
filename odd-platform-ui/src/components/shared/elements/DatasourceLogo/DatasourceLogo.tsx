import React, { type FC, type SVGProps } from 'react';
import styled from 'styled-components';
import { type DatasourceName, DatasourceNames } from 'lib/interfaces';
import { parseDatasourceName } from './helpers';

type BackgroundColor = 'tertiary' | 'default' | 'transparent';

interface DatasourceLogoProps extends SVGProps<SVGRectElement> {
  name: DatasourceName | string;
  width?: number;
  padding?: number;
  rounded?: boolean;
  backgroundColor?: BackgroundColor;
  svg?: boolean;
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
  svg,
  ...props
}) => {
  const parsedName = parseDatasourceName(name);
  const isNameExists = DatasourceNames.includes(parsedName);
  const src = isNameExists ? `/imgs/${parsedName}.png` : `/imgs/default.png`;

  return svg ? (
    <>
      <defs>
        <filter id='logo'>
          <feImage xlinkHref={src} />
        </filter>
      </defs>
      <rect filter='url(#logo)' width={width} {...props} />
    </>
  ) : (
    <Container $padding={padding} $rounded={rounded} $backgroundColor={backgroundColor}>
      <img width={width} src={src} alt={`${parsedName} logo`} />
    </Container>
  );
};

export default DatasourceLogo;
