import React, { type FC } from 'react';
import { Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/system';
import { Link } from 'react-router-dom';
import * as S from './Table.styles';
import type { FlexCell, Row as IRow } from './interfaces';

interface HeaderProps {
  cells: FlexCell[];
  sx?: SxProps<Theme>;
}

export const Header: FC<HeaderProps> = ({ cells, sx }) => (
  <S.HeaderContainer sx={sx}>
    {cells.map(cell => (
      <S.HeaderCell key={cell.content} $flex={cell.flex}>
        <Typography variant='caption'>{cell.content}</Typography>
      </S.HeaderCell>
    ))}
  </S.HeaderContainer>
);

interface RowProps {
  row: IRow;
  sx?: SxProps<Theme>;
}

export const Row: FC<RowProps> = ({ row, sx }) => (
  <Link to={`/${row.id}`}>
    <S.RowContainer sx={sx}>
      {row.cells.map(cell => (
        <S.RowCell key={cell.content} $flex={cell.flex}>
          <Typography variant='body1'>{cell.content}</Typography>
        </S.RowCell>
      ))}
    </S.RowContainer>
  </Link>
);
