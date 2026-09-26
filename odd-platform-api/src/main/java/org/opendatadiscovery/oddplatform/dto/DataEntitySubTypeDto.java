package org.opendatadiscovery.oddplatform.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * SubTypes provide finer granularity for DataEntityTypeDto.
 * For example, a TABLE can be from POSTGRESQL_TABLE, STARROCKS_TABLE, etc.
 * A DASHBOARD can be from TABLEAU_DASHBOARD, FINEBI_DASHBOARD, etc.
 */
@RequiredArgsConstructor
@Getter
public enum DataEntitySubTypeDto {
    // === TABLE subtypes ===
    POSTGRESQL_TABLE("PostgreSQL Table"),
    MYSQL_TABLE("MySQL Table"),
    MSSQL_TABLE("MSSQL Table"),
    ORACLE_TABLE("Oracle Table"),
    MARIADB_TABLE("MariaDB Table"),
    CLICKHOUSE_TABLE("ClickHouse Table"),
    COCKROACHDB_TABLE("CockroachDB Table"),
    SINGLESTORE_TABLE("Singlestore Table"),
    STARROCKS_TABLE("StarRocks Table"),
    DORIS_TABLE("Apache Doris Table"),
    TIDB_TABLE("TiDB Table"),
    DUCKDB_TABLE("DuckDB Table"),
    SQLITE_TABLE("SQLite Table"),
    VERTICA_TABLE("Vertica Table"),
    HIVE_TABLE("Hive Table"),
    PRESTO_TABLE("Presto Table"),
    TRINO_TABLE("Trino Table"),
    DRUID_TABLE("Apache Druid Table"),

    // === VIEW subtypes ===
    POSTGRESQL_VIEW("PostgreSQL View"),
    MYSQL_VIEW("MySQL View"),
    STARROCKS_VIEW("StarRocks View"),

    // === KAFKA_TOPIC subtypes ===
    KAFKA_TOPIC_TYPE("Apache Kafka Topic"),
    ROCKETMQ_TOPIC("RocketMQ Topic"),
    PULSAR_TOPIC("Apache Pulsar Topic"),

    // === DASHBOARD subtypes ===
    TABLEAU_DASHBOARD("Tableau Dashboard"),
    SUPERSET_DASHBOARD("Apache Superset Dashboard"),
    METABASE_DASHBOARD("Metabase Dashboard"),
    REDASH_DASHBOARD("Redash Dashboard"),
    MODE_DASHBOARD("Mode Dashboard"),
    FINEBI_DASHBOARD("FineBI Dashboard"),
    DATAEASE_DASHBOARD("DataEase Dashboard"),
    POWERBI_DASHBOARD("PowerBI Dashboard"),
    QUICKSIGHT_DASHBOARD("AWS QuickSight Dashboard"),
    CUBE_DASHBOARD("Cube.js Dashboard"),

    // === JOB subtypes ===
    AIRFLOW_DAG("Airflow DAG"),
    DBT_JOB("dbt Job"),
    AIRBYTE_JOB("Airbyte Job"),
    FIVETRAN_JOB("Fivetran Job"),
    SPARK_JOB("Apache Spark Job"),

    // === JOB_RUN subtypes ===
    AIRFLOW_TASK_RUN("Airflow Task Run"),
    DBT_RUN("dbt Run"),
    SPARK_RUN("Apache Spark Run"),

    // === MICROSERVICE subtypes ===
    MICROSERVICE_TYPE("Microservice"),

    // === FILE subtypes ===
    S3_FILE("AWS S3 File"),
    GCS_FILE("Google Cloud Storage File"),
    ABS_FILE("Azure Blob Storage File"),
    DELTA_FILE("Delta Lake File"),

    // === DATA_SERVICE subtypes ===
    SNOWFLAKE_SERVICE("Snowflake Service"),
    BIGQUERY_SERVICE("BigQuery Service"),
    REDSHIFT_SERVICE("Redshift Service"),
    DATABRICKS_SERVICE("Databricks Service"),
    GLUE_SERVICE("AWS Glue Service"),

    // === ML subtypes ===
    MLFLOW_EXPERIMENT("MLflow Experiment"),
    KUBEFLOW_EXPERIMENT("Kubeflow Experiment"),
    SAGEMAKER_EXPERIMENT("SageMaker Experiment"),

    // === LOOKUP_TABLE subtypes ===
    LOOKUP_TABLE_TYPE("Lookup Table"),

    // === DATABASE_SERVICE subtypes ===
    POSTGRESQL_SERVICE("PostgreSQL Service"),
    MYSQL_SERVICE("MySQL Service"),
    STARROCKS_SERVICE("StarRocks Service"),
    DORIS_SERVICE("Doris Service"),
    TIDB_SERVICE("TiDB Service"),
    DUCKDB_SERVICE("DuckDB Service"),
    CLICKHOUSE_SERVICE("ClickHouse Service");

    private final String displayName;
}
