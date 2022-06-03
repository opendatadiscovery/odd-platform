# Architecture
[Collector](#collector) \
[Collector vs Adapters](#collector-vs-adapters)

The diagram below contains the structure of the Platform and shows principles of data exchange between ODD and your in-house components.

![](.gitbook/img/architecture_collector.png)

A **Push-client** is a provider which sends information directly to the central repository of the Platform. Also [read](Adapters.md#push-and-pull-strategies) about a push-strategy.
## Collector
> :exclamation: The Collector is an upgraded version of a metadata gathering service. [Adapters](Adapters.md#adapters) will be deprecated soon!  

ODD Collector is a lightweight service which gathers metadata from all your data sources: 
* It manages your metadata according to the [Specification](https://github.com/opendatadiscovery/opendatadiscovery-specification/blob/main/specification/specification.md).
* It connects to all your data sources simultaneously and provides configurable scheduling.

### Collector types 
#### [AWS Collector](https://github.com/opendatadiscovery/odd-collector-aws)
* [Athena](https://github.com/opendatadiscovery/odd-collector-aws#athena)
* [DynamoDB](https://github.com/opendatadiscovery/odd-collector-aws#dynamodb)
* [Glue](https://github.com/opendatadiscovery/odd-collector-aws#glue)
* [Kinesis](https://github.com/opendatadiscovery/odd-collector-aws#kinesis)
* [Quicksight](https://github.com/opendatadiscovery/odd-collector-aws#quicksight)
* [S3](https://github.com/opendatadiscovery/odd-collector-aws#s3)
* [Sagemaker](https://github.com/opendatadiscovery/odd-collector-aws#sagemaker)
* [Sagemaker Featurestore](https://github.com/opendatadiscovery/odd-collector-aws#sagemaker-featurestore)
* [SQS](https://github.com/opendatadiscovery/odd-collector-aws#sqs)

#### [Collector](https://github.com/opendatadiscovery/odd-collector)
* [Cassandra](https://github.com/opendatadiscovery/odd-collector#cassandra)
* [ClickHouse](https://github.com/opendatadiscovery/odd-collector#clickhouse)
* [Dbt](https://github.com/opendatadiscovery/odd-collector#dbt)
* [Elasticsearch](https://github.com/opendatadiscovery/odd-collector#elasticsearch)
* [Feast](https://github.com/opendatadiscovery/odd-collector#feast)
* [Hive](https://github.com/opendatadiscovery/odd-collector#hive)
* [Kubeflow](https://github.com/opendatadiscovery/odd-collector#kubeflow)
* [MongoDB](https://github.com/opendatadiscovery/odd-collector#mongodb)
* [MySQL](https://github.com/opendatadiscovery/odd-collector#mysql)
* [Neo4j](https://github.com/opendatadiscovery/odd-collector#neo4j)
* [PostgreSQL](https://github.com/opendatadiscovery/odd-collector#postgresql)
* [Redshift](https://github.com/opendatadiscovery/odd-collector#redshift)
* [Snowflake](https://github.com/opendatadiscovery/odd-collector#snowflake)
* [Tableau](https://github.com/opendatadiscovery/odd-collector#tableau)
* [Tarantool](https://github.com/opendatadiscovery/odd-collector#tarantool)
## Collector vs Adapters
A previous version of Platform architecture was based on adapters. This approach required to connect new adapter to each data source. Now you can install one Collector and ingest data from all your sources.
### Deprecated Adapters
> :exclamation: To use all features and recent updates of the Platform, we recommend you to install the Collector.

Here is a list of deprecated adapters:
* Glue
* DynamoDB
* S3
* PostgreSQL
* MySQL
* Redshift
* ClickHouse
* Quicksight
