import { DataSetFieldTypeTypeEnum } from 'generated-sources';

export const isComplexField = (fieldType: DataSetFieldTypeTypeEnum) =>
  [
    DataSetFieldTypeTypeEnum.STRUCT,
    DataSetFieldTypeTypeEnum.LIST,
    DataSetFieldTypeTypeEnum.MAP,
  ].includes(fieldType);

// checks if a prop of styled component needs to be forwarded
export const propsChecker = (propForCheck: string) =>
  !propForCheck.startsWith('$');

export const notEmpty = <TValue>(
  value: TValue | null | undefined
): value is TValue => {
  if (value === null || value === undefined) return false;
  const testDummy: TValue = value;
  return true;
};
