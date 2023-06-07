import { capitalizeFirstLetterAndSeparate } from 'lib/helpers';
import type { Cell } from './interfaces';

export const addHeaderCell = (
  acc: Cell[],
  fieldName: string,
  addedFieldNames: Set<string>
) => {
  if (!addedFieldNames.has(fieldName)) {
    const content = capitalizeFirstLetterAndSeparate(fieldName);

    acc.push({ fieldName, content });
    addedFieldNames.add(fieldName);
  }
  return acc;
};
