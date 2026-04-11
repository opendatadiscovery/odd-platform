import type { CSSProperties } from 'react';

export interface Cell {
  fieldName: string;
  content: string;
}

export interface FlexCell extends Cell {
  flex: CSSProperties['flex'];
}

export interface RowCell {
  content: string;
  flex: CSSProperties['flex'];
}

export interface Row {
  id: number;
  cells: RowCell[];
}
