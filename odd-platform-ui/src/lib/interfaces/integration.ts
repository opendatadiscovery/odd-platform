import type {
  Integration as GeneratedIntegration,
  IntegrationContentBlock,
  IntegrationPreview as GeneratedIntegrationPreview,
} from 'generated-sources';

export interface IntegrationContent {
  content: IntegrationContentBlock['content'];
  codeSnippets: IntegrationContentBlock['codeSnippets'];
}

export const DatasourceNames = [
  'clickhouse',
  'mysql',
  'postgresql',
  'snowflake',
  'glue',
  'kafka',
  'kafkaconnect',
  'airflow',
  'hive',
  'elasticsearch',
  'feast',
  'dynamodb',
  'odbc',
  'mssql',
  'oracle',
  'presto',
  'trino',
  'redshift',
  'clickhouse',
  'athena',
  'quicksight',
  'dbt',
  'tableau',
  'prefect',
  'neo4j',
  's3',
  'cassandra',
  'sagemaker',
  'kinesis',
  'kubeflow',
  'tarantool',
  'mongo',
  'vertica',
  'cubejs',
  'superset',
  'metabase',
  'dms',
  'powerbi',
  'redash',
  'airbyte',
  'filesystem',
  'great_expectations',
  'databricks_lakehouse',
  'databricks_feature_store',
  'singlestore',
  'azure',
  'fivetran',
  'lambda',
  'spark',
  'cockroachdb',
  'couchbase',
  'databricks',
  'druid',
  'duckdb',
  'mariadb',
  'sqlite'
] as const;
export type DatasourceName = (typeof DatasourceNames)[number];

export interface Integration extends Omit<GeneratedIntegration, 'contentBlocks' | 'id'> {
  id: DatasourceName;
  contentByTitle: { [title: string]: IntegrationContent };
}

export interface IntegrationPreview extends Omit<GeneratedIntegrationPreview, 'id'> {
  id: DatasourceName;
}
