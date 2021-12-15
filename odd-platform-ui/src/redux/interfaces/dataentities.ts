import {
  DataEntityTypeNameEnum,
  DataEntityDetails,
} from 'generated-sources';

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
  [
    DataEntityTypeNameEnum.ENTITY_GROUP,
    { short: 'DEG', normal: 'Groups', plural: 'Groups' },
  ],
]);

export interface DataEntityDetailsState extends DataEntityDetails {
  unknownSourcesCount: number;
  unknownTargetsCount: number;
  unknownInputsCount: number;
  unknownOutputsCount: number;
}
