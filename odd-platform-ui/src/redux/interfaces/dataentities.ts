import {
  DataEntityDetails,
  DataEntityClassNameEnum,
} from 'generated-sources';

export const DataEntityClassLabelMap: Map<
  DataEntityClassNameEnum,
  { short: string; normal: string; plural: string }
> = new Map([
  [
    DataEntityClassNameEnum.SET,
    { short: 'DS', normal: 'Dataset', plural: 'Datasets' },
  ],
  [
    DataEntityClassNameEnum.CONSUMER,
    { short: 'DC', normal: 'Consumer', plural: 'Data Consumers' },
  ],
  [
    DataEntityClassNameEnum.TRANSFORMER,
    { short: 'TS', normal: 'Transformer', plural: 'Transformers' },
  ],
  [
    DataEntityClassNameEnum.INPUT,
    { short: 'DI', normal: 'Data Input', plural: 'Data Inputs' },
  ],
  [
    DataEntityClassNameEnum.QUALITY_TEST,
    { short: 'QT', normal: 'Quality Test', plural: 'Quality Tests' },
  ],
  [
    DataEntityClassNameEnum.ENTITY_GROUP,
    { short: 'DEG', normal: 'Groups', plural: 'Groups' },
  ],
]);

export interface DataEntityDetailsState extends DataEntityDetails {
  unknownSourcesCount: number;
  unknownTargetsCount: number;
  unknownInputsCount: number;
  unknownOutputsCount: number;
}
