import {
  DataSetFieldType,
  StringFieldStat,
  BooleanFieldStat,
  BinaryFieldStat,
  NumberFieldStat,
  ComplexFieldStat,
  DateTimeFieldStat,
  DataSetFieldTypeTypeEnum,
  Label,
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
  [
    DataSetFieldTypeTypeEnum.BOOLEAN,
    { short: 'Bool', plural: 'booleans' },
  ],
  [DataSetFieldTypeTypeEnum.INTEGER, { short: 'Int', plural: 'integers' }],
  [DataSetFieldTypeTypeEnum.DATETIME, { short: 'Date', plural: 'dates' }],
  [DataSetFieldTypeTypeEnum.BINARY, { short: 'Bin', plural: 'binaries' }],
  [DataSetFieldTypeTypeEnum.NUMBER, { short: 'Dec', plural: 'decimals' }],
  [DataSetFieldTypeTypeEnum.STRUCT, { short: 'Struct', plural: '' }],
  [DataSetFieldTypeTypeEnum.LIST, { short: 'List', plural: '' }],
  [DataSetFieldTypeTypeEnum.MAP, { short: 'Map', plural: '' }],
]);

export type DataSetFormattedStatsKeys = keyof Required<DataSetFormattedStats>;

export const DatasetStatsLabelMap: Map<
  DataSetFormattedStatsKeys,
  string
> = new Map([
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

export interface UpdateDataSetFieldInternalDescriptionParams {
  datasetFieldId: number;
  internalDescription: string;
}

export interface UpdateDataSetFieldLabelsParams {
  datasetFieldId: number;
  labels: Label[];
}

export type DataSetStructureTypesCount = Partial<
  Record<DataSetFieldType['type'], number>
>;
