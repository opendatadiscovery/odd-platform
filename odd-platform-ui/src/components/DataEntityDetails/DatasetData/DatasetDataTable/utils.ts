import type { LookupTableRowFormData } from 'generated-sources';
import { LookupTableFieldType } from 'generated-sources';
import type { TableData } from './interfaces';

export const buildTableRowData = (row: TableData): LookupTableRowFormData => {
  const entries = Object.entries(row);
  return {
    items: entries.map(([k, v]) => ({ fieldId: Number(k), value: String(v) })),
  };
};

export const readValue = (v: unknown, fieldType?: LookupTableFieldType) => {
  switch (fieldType) {
    case LookupTableFieldType.DATE:
      return new Date(v as string).toLocaleDateString();
    case LookupTableFieldType.TIME:
      return new Date(v as string).toLocaleTimeString();
    case LookupTableFieldType.BOOLEAN:
      return Boolean(v);
    case LookupTableFieldType.DECIMAL:
      return Number(v);
    case LookupTableFieldType.INTEGER:
      return Number(v);
    default:
      return String(v);
  }
};
