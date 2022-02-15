# Features
[Federation Data Catalogue](#federation-data-catalogue) \
End-to-end Data Objects Lineage \
End-to-end Microservices Lineage \
Meta Data Storage \
Manual Object Tagging \
Data Quality Test Results Import \
ML Experiment Logging \
Pipeline monitoring and alerting 
## Federation Data Catalogue
The Catalogue is a tool which helps to bring distributed catalogues together in the Platform. \
\
**How it works.** You connect each catalogue to the Platform &rarr; It pulls the data without postprocessing (statistics creation and data cleansing are not supported) to save in ODD servers &rarr; The data from each source automatically occurs in a Platform account. \
\
To collect data from decentralized sources ODD uses a pull strategy (read more about strategies [here](Architecture.md#push-and-pull-strategies)). \
To connect your data sources with the Platform use the [API](https://github.com/opendatadiscovery/odd-platform/tree/main/odd-platform-specification). 

## End-to-end Data Objects Lineage
The Platform supports a lineage diagram, so you can easily track movement and change of  your data entities. \
ODD supports the following **data objects**: 
* Datasets
* Data sources
* ETL and ML training jobs and their execution scripts
* Data representation engines (ML model artifacts and BI dashboards)
* Data quality tests and their scheduling scripts

| Syntax      | Description | Test Text     |
| :---        |    :----:   |          ---: |
| Header      | Title       | Here's this   |
| Paragraph   | Text        | And more      |

## End-to-end Microservices Lineage 
This is an ODD killer feature to support not only object lineage, but also microservices lineage. 
## Meta Data Storage 
*In progress*
## Manual Object Tagging 
*In progress*
## Data Quality Test Results Import
*In progress*
## ML Experiment Logging 
*In progress*
## Pipeline monitoring and alerting 
*In progress*