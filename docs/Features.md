# Features
[Federation Data Catalogue](#federation-data-catalogue) \
[End-to-end Data Objects Lineage](#end-to-end-data-object-lineage) \
[End-to-end Microservices Lineage](#end-to-end-microservices-lineage) \
[Metadata Storage](#metadata-storage) \
[Manual Object Tagging](#manual-object-tagging) \
[Data Quality Test Results Import](#data-quality-test-results-import) \
[ML Experiment Logging](#ml-experiment-logging) \
[Pipeline monitoring and alerting](#pipeline-monitoring-and-alerting) 
## Federation Data Catalogue
The Catalogue is a tool which helps to bring distributed catalogues together in the Platform. \
\
**How it works.** You connect each catalogue to the Platform &rarr; It pulls the data without postprocessing (statistics creation and data cleansing are not supported) to save in ODD servers &rarr; The data from each source automatically occurs in a Platform account. \
\
To collect data from decentralized sources ODD uses a pull strategy (read more about strategies [here](Architecture.md#push-and-pull-strategies)). \
To connect your data sources with the Platform use the [API](https://github.com/opendatadiscovery/odd-platform/tree/main/odd-platform-specification). 

## End-to-end Data Objects Lineage
The Platform supports a lineage diagram, so you can easily track movement and change of your data entities. \
ODD supports the following **data objects**: 
* Datasets
* Data sources
* ETL and ML training jobs and their execution scripts
* Data representation engines (ML model artifacts and BI dashboards)
* Data quality tests and their scheduling scripts
>>> *these points above are entities mentioned in the spec. maybe i should put their names here for better understanding.*

![](.gitbook/img/lineage.gif) 

## End-to-end Microservices Lineage 
This feature helps trace data provenance of your microservice-based app. \
ODD represents microservices as objects and shows their lineage as a typical diagram.
## Metadata Storage 
The Storage gathers metadata about all elements of your system.
>>> *Here I'd like to say more about the Storage. Is it a DB or smth else? Do we have storage limits for each user? What is a storage format? key-value format or smth else? What is an update frequency?*
### Advanced search 
In your Platform account you may find any metadata element using the following options:
* Full-text search 
* Filtering by datasources, owners and tags 
## Manual Object Tagging 
Manage your metadata by tagging tables, datasets and quality tests. Tags provide easy filtering and searching. Create your own tags or use pre-defined ones. 
>>> *Is it correct that we have  pre-defined? I mean, whether a new user can choose a tag or label before he creates his own?* 

### Tag both tables and each column
You may apply **tags** to metadata entities and also *labels* to elements of these entities. 
>>> *Do we have limits for the number of tags and labels?*
## Data Quality Test Results Import
Monitor test suite results in the Platform and at the same time save test data private because they don't migrate to your ODD account. \
The Platform is compatible with **Pandas** and **Great expectations**.
>>> *Do we have some guides for  these integrations?*
## ML Experiment Logging 
The Platform helps track and compare your experiments. It enables you to:
* Explore a list of your experiment's entities (tables, **smth else?**) using the **Groups** section
* Log the most successful experimtnes by adding the **Custom metadata**. 

>>> *What is pre-defined section under the Custom one? Is it important to inform what kind of metadata can we add (value, date, bool)? Is it ok to mention lineage here?*
## Pipeline monitoring and alerting 

### Alerting 
In the Platform you may find two types of alerts: 
* Notifications for cases when somthing goes wrong with entities you assigned to as an owner
* Notifications for upstream and downstream items.
>>> *is there any push message or e-mail triggered by an alert or the only way to learn about new alert is going to the main page?* 

**Dataset alerts** detect missing fields and **job alerts** inform about source changing. 



<!---
| Object name | Description |
| --- | ----------- |
| **DataInput** | Title |
| **DataInput** | Title |
-->