import {
  BinaryFieldStat,
  BooleanFieldStat,
  ComplexFieldStat,
  DataSetField,
  DataSetFieldType,
  DataSetFieldTypeTypeEnum,
  DateTimeFieldStat,
  EnumValue,
  Label,
  NumberFieldStat,
  StringFieldStat,
} from 'generated-sources';

export type DataSetFormattedStats = StringFieldStat &
  BooleanFieldStat &
  BinaryFieldStat &
  NumberFieldStat &
  DateTimeFieldStat &
  ComplexFieldStat;

export const DatasetTypeLabelMap: Map<
  DataSetFieldTypeTypeEnum,
  { short: string; plural: string }
> = new Map([
  [DataSetFieldTypeTypeEnum.STRING, { short: 'Str', plural: 'strings' }],
  [DataSetFieldTypeTypeEnum.BOOLEAN, { short: 'Bool', plural: 'booleans' }],
  [DataSetFieldTypeTypeEnum.INTEGER, { short: 'Int', plural: 'integers' }],
  [DataSetFieldTypeTypeEnum.DATETIME, { short: 'Date', plural: 'dates' }],
  [DataSetFieldTypeTypeEnum.BINARY, { short: 'Bin', plural: 'binaries' }],
  [DataSetFieldTypeTypeEnum.NUMBER, { short: 'Dec', plural: 'decimals' }],
  [DataSetFieldTypeTypeEnum.STRUCT, { short: 'Struct', plural: 'structures' }],
  [DataSetFieldTypeTypeEnum.LIST, { short: 'List', plural: 'lists' }],
  [DataSetFieldTypeTypeEnum.MAP, { short: 'Map', plural: 'maps' }],
  [DataSetFieldTypeTypeEnum.CHAR, { short: 'Char', plural: 'chars' }],
  [DataSetFieldTypeTypeEnum.TIME, { short: 'Time', plural: 'times' }],
  [DataSetFieldTypeTypeEnum.UNION, { short: 'Union', plural: 'unions' }],
  [DataSetFieldTypeTypeEnum.DURATION, { short: 'Dur', plural: 'durations' }],
  [DataSetFieldTypeTypeEnum.UNKNOWN, { short: 'Unk', plural: 'unknowns' }],
]);

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

export interface UpdateDataSetFieldFormResponse {
  datasetFieldId: number;
  internalDescription?: string;
  labels?: Label[];
}

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
  enumValueList: EnumValue[] | undefined;
}

export interface DatasetStructureIds {
  datasetId: number;
  versionId?: number;
  parentFieldId?: number;
}
