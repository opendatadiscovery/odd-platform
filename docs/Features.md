# Features
[Federation Data Catalogue](#federation-data-catalogue) \
[End-to-end Data Objects Lineage](end-to-end-data-objecs-lineage) \
End-to-end Microservices Lineage \
Meta Data Storage \
Manual Object Tagging \
Data Quality Test Results Import \
ML Experiment Logging \
Pipeline monitoring and alerting 
## Federation Data Catalogue
The Catalogue is a tool which helps to bring distributed catalogues together in the Platform. \
**How it works.** You connect each catalogue to the Platform &rarr; It pulls the data without postprocessing (statistics creation and data cleansing are not supported) to save in ODD servers &rarr; The data from each source automatically occurs in a Platform account. \
To collect data from decentralized sources ODD uses a pull strategy (read more about strategies [here](Architecture.md#push-and-pull-strategies)). \
To connect your data sources with the Platform use the [API](https://github.com/opendatadiscovery/odd-platform/tree/main/odd-platform-specification). 

## End-to-end Data Objects Lineage