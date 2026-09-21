import {
  RESULT_COLUMNS_STORAGE_KEY,
  parseStoredColumns,
  serializeStoredColumns,
  type ResultColumnId,
} from './resultColumns';

/**
 * ST-13a (#1847, ADR D7 "persist client-side first") — the browser's stored result-column layout: the baseline a
 * search starts from when its URL carries no `columns`. Reads and writes are wrapped because `localStorage` can
 * throw (a private window, blocked site data) and the table must render regardless; a throw reads as "nothing
 * stored" and a failed write is silently dropped (the layout still applies for the session through the URL).
 */
export function readStoredColumns(): ResultColumnId[] | undefined {
  try {
    return parseStoredColumns(window.localStorage.getItem(RESULT_COLUMNS_STORAGE_KEY));
  } catch {
    return undefined;
  }
}

export function writeStoredColumns(columns: readonly ResultColumnId[]): void {
  try {
    window.localStorage.setItem(
      RESULT_COLUMNS_STORAGE_KEY,
      serializeStoredColumns(columns)
    );
  } catch {
    // a storage that refuses the write is not an error the user can act on; the URL still carries the layout
  }
}
