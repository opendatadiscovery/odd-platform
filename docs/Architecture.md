# Architecture

The diagram below contains the structure of the Platform and shows principles of data exchange between ODD and your in-house components.

![](.gitbook/img/architecture\_collector.png)

**Push-client** is a provider which sends information directly to the central repository of the Platform. Also [read](https://github.com/opendatadiscovery/opendatadiscovery-specification/blob/main/specification/specification.md#push-model) about a push-strategy.
<<<<<<< HEAD

**ODD Collector** is a lightweight service which gathers metadata from all your data sources:

* It manages your metadata according to the [Specification](https://github.com/opendatadiscovery/opendatadiscovery-specification/blob/main/specification/specification.md).
* It connects to all your data sources simultaneously and provides configurable scheduling.

**ODDRN** (Open Data Discovery Resource Name) is a unique resource name that identifies entities such as data sources, data entities, dataset fields etc. It is used to built lineage and update metadata. [Read more](ingestion/oddrn.md)
=======

**ODD Collector** is a lightweight service which gathers metadata from all your data sources: 
* It manages your metadata according to the [Specification](https://github.com/opendatadiscovery/opendatadiscovery-specification/blob/main/specification/specification.md).
* It connects to all your data sources simultaneously and provides configurable scheduling.

### Collector types 
#### [Collector](https://github.com/opendatadiscovery/odd-collector)
* Cassandra
* ClickHouse
* Dbt
* Elasticsearch
* Feast
* Hive
* Kubeflow
* MongoDB
* MySQL
* Neo4j
* PostgreSQL
* Redshift
* Snowflake
* Tableau
* Tarantool

[Config examples →](https://github.com/opendatadiscovery/odd-collector/tree/main/config_examples)

#### [AWS Collector](https://github.com/opendatadiscovery/odd-collector-aws)
* Athena
* DynamoDB
* Glue
* Kinesis
* Quicksight
* S3
* Sagemaker
* Sagemaker Featurestore
* SQS

[Config examples →](https://github.com/opendatadiscovery/odd-collector-aws/tree/main/config_examples)

#### [GCP Collector](https://github.com/opendatadiscovery/odd-collector-gcp)
* BigQuery

[Config examples →](https://github.com/opendatadiscovery/odd-collector-gcp#config-example)
<!---
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
>>>>>>> 84683c91ce4f2a1079bf5a10e7733b7ff0cd19d5
