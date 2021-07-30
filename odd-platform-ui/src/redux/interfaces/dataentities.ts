import { DataEntityTypeNameEnum } from 'generated-sources';

export interface UpdateDataEntityParams {
  dataEntityId: number;
}

export interface PartialDataEntityUpdateParams<T> {
  dataEntityId: number;
  value: T;
}

export interface PartialQATestParams<T> {
  dataqatestId: number;
  value: T;
}

export const DataEntityTypeLabelMap: Map<
  DataEntityTypeNameEnum,
  { short: string; normal: string; plural: string }
> = new Map([
  [
    DataEntityTypeNameEnum.SET,
    { short: 'DS', normal: 'Dataset', plural: 'Datasets' },
  ],
  [
    DataEntityTypeNameEnum.CONSUMER,
    { short: 'DC', normal: 'Consumer', plural: 'Data Consumers' },
  ],
  [
    DataEntityTypeNameEnum.TRANSFORMER,
    { short: 'TS', normal: 'Transformer', plural: 'Transformers' },
  ],
  [
    DataEntityTypeNameEnum.INPUT,
    { short: 'DI', normal: 'Data Input', plural: 'Data Inputs' },
  ],
  [
    DataEntityTypeNameEnum.QUALITY_TEST,
    { short: 'QT', normal: 'Quality Test', plural: 'Quality Tests' },
  ],
]);
