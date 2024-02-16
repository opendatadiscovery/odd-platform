import {
  type AlertHaltConfigActivityState,
  AlertType,
  DataEntityClassNameEnum as ClassNameEnum,
  type DataEntityHighlight,
  type DataEntitySearchHighlight,
  DataEntityTypeNameEnum as TypeNameEnum,
  DataQualityTestSeverity,
  type DataSourceHighlight,
} from 'generated-sources';

export const ORDERED_SEVERITY = [
  DataQualityTestSeverity.CRITICAL,
  DataQualityTestSeverity.MAJOR,
  DataQualityTestSeverity.MINOR,
];

export const alertTitlesMap = new Map<
  AlertType | keyof AlertHaltConfigActivityState,
  string
>([
  [AlertType.BACKWARDS_INCOMPATIBLE_SCHEMA, 'Backwards incompatible schema'],
  ['incompatibleSchemaHaltUntil', 'Backwards incompatible schema'],
  [AlertType.FAILED_JOB, 'Failed job'],
  ['failedJobHaltUntil', 'Failed job'],
  [AlertType.FAILED_DQ_TEST, 'Failed DQ test'],
  ['failedDqTestHaltUntil', 'Failed DQ test'],
  [AlertType.DISTRIBUTION_ANOMALY, 'Distribution anomaly'],
  ['distributionAnomalyHaltUntil', 'Distribution anomaly'],
]);

export type SearchHighlightsTitlesKey =
  | keyof DataEntitySearchHighlight
  | keyof DataEntityHighlight
  | keyof DataSourceHighlight;
export const searchHighlightsTitlesMap = new Map<SearchHighlightsTitlesKey, string>([
  ['dataEntity', 'Data entity'],
  ['internalName', 'Business name'],
  ['externalName', 'External name'],
  ['internalDescription', 'Internal Description'],
  ['externalDescription', 'External Description'],
  ['dataSource', 'Data source'],
  ['name', 'Name'],
  ['oddrn', 'ODDRN'],
  ['namespace', 'Namespace'],
  ['tags', 'Tag'],
  ['datasetStructure', 'Dataset structure'],
  ['metadata', 'Metadata'],
  ['owners', 'Owner'],
]);

export const DataEntityClassLabelMap: Map<
  ClassNameEnum,
  { short: string; normal: string; plural: string }
> = new Map([
  [ClassNameEnum.SET, { short: 'DS', normal: 'Dataset', plural: 'Datasets' }],
  [ClassNameEnum.CONSUMER, { short: 'DC', normal: 'Consumer', plural: 'Data Consumers' }],
  [
    ClassNameEnum.TRANSFORMER,
    { short: 'TS', normal: 'Transformer', plural: 'Transformers' },
  ],
  [ClassNameEnum.INPUT, { short: 'DI', normal: 'Data Input', plural: 'Data Inputs' }],
  [
    ClassNameEnum.QUALITY_TEST,
    { short: 'QT', normal: 'Quality Test', plural: 'Quality Tests' },
  ],
  [ClassNameEnum.ENTITY_GROUP, { short: 'DEG', normal: 'Groups', plural: 'Groups' }],
  [
    ClassNameEnum.QUALITY_TEST_RUN,
    { short: 'QTR', normal: 'Quality Test Run', plural: 'Quality Test Runs' },
  ],
  [
    ClassNameEnum.TRANSFORMER_RUN,
    { short: 'TSR', normal: 'Transformer Run', plural: 'Transformer Runs' },
  ],
  [
    ClassNameEnum.RELATIONSHIP,
    { short: 'REL', normal: 'Relationship', plural: 'Relationships' },
  ],
]);

export const DataEntityClassTypeLabelMap: Map<
  TypeNameEnum,
  { normal: string; plural: string }
> = new Map([
  [TypeNameEnum.TABLE, { normal: 'Table', plural: 'Tables' }],
  [TypeNameEnum.FILE, { normal: 'File', plural: 'Files' }],
  [TypeNameEnum.FEATURE_GROUP, { normal: 'Feature group', plural: 'Feature groups' }],
  [TypeNameEnum.KAFKA_TOPIC, { normal: 'Kafka topic', plural: 'Kafka topics' }],
  [TypeNameEnum.JOB, { normal: 'Job', plural: 'Jobs' }],
  [TypeNameEnum.JOB_RUN, { normal: 'Job run', plural: 'Job runs' }],
  [TypeNameEnum.ML_EXPERIMENT, { normal: 'ML experiment', plural: 'ML experiments' }],
  [
    TypeNameEnum.ML_MODEL_TRAINING,
    { normal: 'ML model training', plural: 'ML models training' },
  ],
  [
    TypeNameEnum.ML_MODEL_INSTANCE,
    { normal: 'ML model instance', plural: 'ML model instances' },
  ],
  [
    TypeNameEnum.ML_MODEL_ARTIFACT,
    { normal: 'ML model artifact', plural: 'ML model artifacts' },
  ],
  [TypeNameEnum.DASHBOARD, { normal: 'Dashboard', plural: 'Dashboards' }],
  [TypeNameEnum.VIEW, { normal: 'View', plural: 'Views' }],
  [TypeNameEnum.DAG, { normal: 'Dag', plural: 'Dags' }],
  [TypeNameEnum.GRAPH_NODE, { normal: 'Graph node', plural: 'Graph nodes' }],
  [TypeNameEnum.API_CALL, { normal: 'Api call', plural: 'Api calls' }],
  [TypeNameEnum.MICROSERVICE, { normal: 'Microservice', plural: 'Microservices' }],
  [
    TypeNameEnum.DATABASE_SERVICE,
    { normal: 'Database service', plural: 'Database services' },
  ],
  [TypeNameEnum.API_SERVICE, { normal: 'API service', plural: 'API services' }],
  [TypeNameEnum.KAFKA_SERVICE, { normal: 'Kafka service', plural: 'Kafka services' }],
  [TypeNameEnum.DOMAIN, { normal: 'Domain', plural: 'Domains' }],
  [
    TypeNameEnum.ENTITY_RELATIONSHIP,
    { normal: 'Entity-Relationships', plural: 'Entity-Relationships' },
  ],
  [
    TypeNameEnum.GRAPH_RELATIONSHIP,
    { normal: 'Graph Relationship', plural: 'Graph Relationships' },
  ],
]);

// content width constants
export const toolbarHeight = 48;
export const maxSidebarWidth = 240;
export const maxChannelsWidth = 200;
export const activitySidebarWidth = 192;
export const maxContentWidth = 1216;
export const maxContentWidthWithoutSidebar = 1440;
export const maxTagsContainerWidth = 960;
export const maxIdentityFormContentWidth = '320px';

// main skeleton height constant
export const mainSkeletonHeight = '100%';

// tabs constants
export const primaryTabsHeight = 32;
export const tabsContainerMargin = 16;

// time formats
export const mainEUDateTimeFormat = 'dd MMM yyyy, HH:mm';
export const mainUSDateTimeFormat = 'MMM dd yyyy, h:mm a';
export const mainEUDateFormat = 'd MMM yyyy';
export const mainUSDateFormat = 'MMM d yyyy';
export const datedListFormat = 'MMMM dd, yyyy';

// empty structures
export const emptyArr = [];
export const emptyObj = {};

export const LANGUAGES_MAP = {
  en: 'English',
  es: 'Spanish',
  ch: 'Chinese',
  fr: 'French',
  ua: 'Ukrainian',
  hy: 'Armenian',
} as const;

export const LANG_TO_COUNTRY_CODE_MAP = {
  en: 'gb',
  es: 'es',
  ch: 'cn',
  fr: 'fr',
  ua: 'ua',
  hy: 'am',
} as const;

// regexp
export const TERM_PATTERN = /\[\[([^:\]]+):([^\]]+)\]\]/g;
