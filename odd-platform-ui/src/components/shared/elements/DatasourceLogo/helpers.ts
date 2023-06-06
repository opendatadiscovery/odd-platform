import type { DatasourceName } from 'lib/interfaces';
import capitalize from 'lodash/capitalize';

export function parseDatasourceName(input: string): DatasourceName {
  if (input.includes('-')) {
    return input.split('-')[0] as DatasourceName;
  }

  const regex = /^\/\/([^/]+)/;
  const match = regex.exec(input);
  return match ? (match[1] as DatasourceName) : (input as DatasourceName);
}

export function getCapitalizedDatasourceNameFromPrefix(input: string) {
  const name = parseDatasourceName(input);

  return capitalize(name);
}
