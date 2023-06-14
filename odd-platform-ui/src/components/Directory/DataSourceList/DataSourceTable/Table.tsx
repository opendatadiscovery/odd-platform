import React, { type FC } from 'react';
import { Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/system';
import { Link } from 'react-router-dom';
import { Table } from 'components/shared/elements';
import type { FlexCell, Row as IRow } from './interfaces';

interface HeaderProps {
  cells: FlexCell[];
  sx?: SxProps<Theme>;
}

export const Header: FC<HeaderProps> = ({ cells, sx }) => (
  <Table.HeaderContainer sx={sx}>
    {cells.map(cell => (
      <Table.Cell key={cell.content} $flex={cell.flex}>
        <Typography variant='caption'>{cell.content}</Typography>
      </Table.Cell>
    ))}
  </Table.HeaderContainer>
);

interface RowProps {
  row: IRow;
  sx?: SxProps<Theme>;
}

export const Row: FC<RowProps> = ({ row, sx }) => (
  <Link to={`./${row.id}`}>
    <Table.RowContainer sx={sx}>
      {row.cells.map(cell => (
        <Table.Cell key={cell.content} $flex={cell.flex}>
          <Typography variant='body1'>{cell.content}</Typography>
        </Table.Cell>
      ))}
    </Table.RowContainer>
  </Link>
);
