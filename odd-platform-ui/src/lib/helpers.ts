import { DataSetFieldTypeTypeEnum } from 'generated-sources';

export const isComplexField = (fieldType: DataSetFieldTypeTypeEnum) =>
  [
    DataSetFieldTypeTypeEnum.STRUCT,
    DataSetFieldTypeTypeEnum.LIST,
    DataSetFieldTypeTypeEnum.MAP,
  ].includes(fieldType);

// checks if a prop of styled component needs to be forwarded
export const propsChecker = (propForCheck: PropertyKey, props: string[]) =>
  !props.includes(propForCheck as string);
