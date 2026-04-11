import type { LookupTableRowFormData } from 'generated-sources';
import type { TableData } from './interfaces';

export const buildTableRowData = (row: TableData): LookupTableRowFormData => ({
  items: Object.entries(row).map(([k, v]) => ({
    fieldId: Number(k),
    value: v as string,
  })),
});
