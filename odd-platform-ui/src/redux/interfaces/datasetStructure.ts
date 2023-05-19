import {
  type DataSetFieldTypeTypeEnum,
  type BinaryFieldStat,
  type BooleanFieldStat,
  type ComplexFieldStat,
  type DataSetField,
  type DataSetFieldType,
  type DateTimeFieldStat,
  type EnumValueList,
  type NumberFieldStat,
  type StringFieldStat,
  type IntegerFieldStat,
} from 'generated-sources';

export type DataSetFormattedStats = StringFieldStat &
  BooleanFieldStat &
  BinaryFieldStat &
  NumberFieldStat &
  DateTimeFieldStat &
  ComplexFieldStat &
  IntegerFieldStat;

export const DatasetTypeLabelMap: Record<
  DataSetFieldTypeTypeEnum,
  { short: string; plural: string }
> = {
  TYPE_STRING: { short: 'Str', plural: 'strings' },
  TYPE_BOOLEAN: { short: 'Bool', plural: 'booleans' },
  TYPE_INTEGER: { short: 'Int', plural: 'integers' },
  TYPE_DATETIME: { short: 'Date', plural: 'dates' },
  TYPE_BINARY: { short: 'Bin', plural: 'binaries' },
  TYPE_NUMBER: { short: 'Dec', plural: 'decimals' },
  TYPE_STRUCT: { short: 'Struct', plural: 'structures' },
  TYPE_LIST: { short: 'List', plural: 'lists' },
  TYPE_MAP: { short: 'Map', plural: 'maps' },
  TYPE_CHAR: { short: 'Char', plural: 'chars' },
  TYPE_TIME: { short: 'Time', plural: 'times' },
  TYPE_UNION: { short: 'Union', plural: 'unions' },
  TYPE_DURATION: { short: 'Dur', plural: 'durations' },
  TYPE_UNKNOWN: { short: 'Unk', plural: 'unknowns' },
  TYPE_REFERENCE: { short: 'Ref', plural: 'references' },
};

export type DataSetFormattedStatsKeys = keyof Required<DataSetFormattedStats>;

export const DatasetStatsLabelMap: Map<DataSetFormattedStatsKeys, string> = new Map([
  ['maxLength', 'Max length'],
  ['avgLength', 'Avg length'],
  ['nullsCount', ''],
  ['uniqueCount', ''],
  ['trueCount', 'True'],
  ['falseCount', 'False'],
  ['lowValue', 'Min'],
  ['highValue', 'Max'],
  ['meanValue', 'Mean'],
  ['medianValue', 'Median'],
]);

export type DataSetStructureTypesCount = Partial<
  Record<DataSetFieldType['type'], number>
>;

export interface DataSetStructureResponse {
  dataEntityId: number;
  dataSetVersionId: number;
  fieldList: DataSetField[];
  isLatestVersion: boolean;
}

export interface DataSetFieldEnumsResponse {
  datasetFieldId: number;
  enumValueList: EnumValueList;
}

export interface DatasetStructureIds {
  datasetId: number;
  versionId?: number;
  parentFieldId?: number;
}
