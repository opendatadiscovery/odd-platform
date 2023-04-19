import {
  DataEntityTypeNameEnum,
  DataEntityClassNameEnum,
  type DataEntity as GeneratedDataEntity,
  type DataEntityDetails,
} from 'generated-sources';
import type { SerializeDateToNumber } from 'redux/interfaces/common';

export type DataEntity = SerializeDateToNumber<GeneratedDataEntity>;

export interface DataEntityDetailsState extends DataEntityDetails {
  unknownSourcesCount: number;
  unknownTargetsCount: number;
  unknownInputsCount: number;
  unknownOutputsCount: number;
}

export const DataEntityClassLabelMap: Map<
  DataEntityClassNameEnum,
  { short: string; normal: string; plural: string }
> = new Map([
  [DataEntityClassNameEnum.SET, { short: 'DS', normal: 'Dataset', plural: 'Datasets' }],
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
  [
    DataEntityClassNameEnum.QUALITY_TEST_RUN,
    {
      short: 'QTR',
      normal: 'Quality Test Run',
      plural: 'Quality Test Runs',
    },
  ],
  [
    DataEntityClassNameEnum.TRANSFORMER_RUN,
    {
      short: 'TSR',
      normal: 'Transformer Run',
      plural: 'Transformer Runs',
    },
  ],
]);

export const DataEntityClassTypeLabelMap: Map<
  DataEntityTypeNameEnum,
  { normal: string; plural: string }
> = new Map([
  [DataEntityTypeNameEnum.TABLE, { normal: 'Table', plural: 'Tables' }],
  [DataEntityTypeNameEnum.FILE, { normal: 'File', plural: 'Files' }],
  [
    DataEntityTypeNameEnum.FEATURE_GROUP,
    { normal: 'Feature group', plural: 'Feature groups' },
  ],
  [DataEntityTypeNameEnum.KAFKA_TOPIC, { normal: 'Kafka topic', plural: 'Kafka topics' }],
  [DataEntityTypeNameEnum.JOB, { normal: 'Job', plural: 'Jobs' }],
  [DataEntityTypeNameEnum.JOB_RUN, { normal: 'Job run', plural: 'Job runs' }],
  [
    DataEntityTypeNameEnum.ML_EXPERIMENT,
    { normal: 'ML experiment', plural: 'ML experiments' },
  ],
  [
    DataEntityTypeNameEnum.ML_MODEL_TRAINING,
    { normal: 'ML model training', plural: 'ML models training' },
  ],
  [
    DataEntityTypeNameEnum.ML_MODEL_INSTANCE,
    { normal: 'ML model instance', plural: 'ML model instances' },
  ],
  [
    DataEntityTypeNameEnum.ML_MODEL_ARTIFACT,
    { normal: 'ML model artifact', plural: 'ML model artifacts' },
  ],
  [DataEntityTypeNameEnum.DASHBOARD, { normal: 'Dashboard', plural: 'Dashboards' }],
  [DataEntityTypeNameEnum.VIEW, { normal: 'View', plural: 'Views' }],
  [DataEntityTypeNameEnum.DAG, { normal: 'Dag', plural: 'Dags' }],
  [DataEntityTypeNameEnum.GRAPH_NODE, { normal: 'Graph node', plural: 'Graph nodes' }],
  [DataEntityTypeNameEnum.API_CALL, { normal: 'Api call', plural: 'Api calls' }],
  [
    DataEntityTypeNameEnum.MICROSERVICE,
    { normal: 'Microservice', plural: 'Microservices' },
  ],
  [
    DataEntityTypeNameEnum.DATABASE_SERVICE,
    { normal: 'Database service', plural: 'Database services' },
  ],
  [DataEntityTypeNameEnum.API_SERVICE, { normal: 'API service', plural: 'API services' }],
  [
    DataEntityTypeNameEnum.KAFKA_SERVICE,
    { normal: 'Kafka service', plural: 'Kafka services' },
  ],
  [DataEntityTypeNameEnum.DOMAIN, { normal: 'Domain', plural: 'Domains' }],
]);
