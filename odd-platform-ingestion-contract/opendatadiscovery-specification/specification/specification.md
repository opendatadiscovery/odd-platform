# Specification

Version: Draft

## OpenDataDiscovery scope

OpenDataDiscovery specification is intentionally agnostic about the specifics of particular data sources and data catalogs. It exists to describe the semantics of data discovery process.

## Discovery process

Metadata discovery process is very similar to metrics/logs/traces gathering process. We might have pull or push model. Both of them are better for their use cases.

![Architecture](assets/arc.png)

### Pull model

Pulling metadata directly from the source seems is the most straightforward way to gather metadata, but it may become a nightmare to develope and maintain a centralized fleet of domain-specific crawlers. OpenDataDiscovery introduces new entity: OpenDataDiscovery Adapter. The main goal of these adapters are to be source specific and expose only information could be gathered from certain data source.

![Pull model](assets/pull.png)

Preferred if:

* Latency on index update is ok
* There is already an adapter

### Push model

It supports for individual metadata providers to push the information in the central repository via APIs.
This could be more preferred way for certain use cases. For example Airflow jobs runs and quality check runs.

![Push model](assets/push.png)

Preferred if:

* Near-realtime index is important
* There is no implemented adapter
* Information could be gathered only during job time

## DataModel

Knowledge about data is spread amongst many people and systems. OpenDataDiscovery role is to provide a standard protocol how metadata can be collected and correlated in as automated fashion as possible.
To enable many different datasources and tools to expose the metadata we need agreement on what data should be exposed and in what format (structures).
Specification contains of high level entities  DataInputs, DataTransformers, DataSets and DataConsumers.
Each entity has a unique url describing a place, system and an identifier in this system.

###  DataInputs

Is a source of your data, it could be described as a website url, external s3 bucket or real life data place.
```yaml
DataInput:
    properties:
        oddrn:
            example: //http/www.amazon.com/goods
            type: string
        name:
            type: string
        owner:
            example: //aws/iam/{account_id}/user/name
            type: string
        description:
            type: string
    required:
        - description
```

### DataSets

DataSet is a collection of data stored in structured, semi-structured or unstructured format.
It might be a table in relational database, parquet file on s3 bucket, hive catalog table and so on.
DataSets could have subdatasets. For example Hive table is a dataset itself and it consists of DataSets as a folders/files on HDFS/S3.

```yaml
    DataSet:
      type: object
      properties:
        parent_oddrn:
          type: string
        description:
          type: string
        rows_number:
          type: integer
          format: int64
        subtype:
          type: string
          enum:
            - DATASET_TABLE
            - DATASET_VIEW
            - DATASET_FILE
            - DATASET_FEATURE_GROUP
            - DATASET_TOPIC
        field_list:
          type: array
          items:
            $ref: '#/components/schemas/DataSetField'
      required:
        - subtype
        - field_list

    DataSetField:
      allOf:
        - $ref: '#/components/schemas/BaseObject'
        - type: object
          properties:
            parent_field_oddrn:
              type: string
            type:
              $ref: '#/components/schemas/DataSetFieldType'
            is_key:
              type: boolean
            is_value:
              type: boolean
            default_value:
              type: string
            description:
              type: string
            stats:
              $ref: '#/components/schemas/DataSetFieldStat'
          required:
            - type

    DataSetFieldType:
      type: object
      properties:
        type:
          type: string
          enum:
            - TYPE_STRING
            - TYPE_NUMBER
            - TYPE_INTEGER
            - TYPE_BOOLEAN
            - TYPE_CHAR
            - TYPE_DATETIME
            - TYPE_TIME
            - TYPE_STRUCT
            - TYPE_BINARY
            - TYPE_LIST
            - TYPE_MAP
            - TYPE_UNION
            - TYPE_DURATION
            - TYPE_UNKNOWN
        logical_type:
          type: string
        is_nullable:
          type: boolean
      required:
        - type
        - is_nullable
```

#### Tables

Example oddrn
```//postgresql/{host}/{database}/{schema}/{tablename}```

#### Files

Example url:
```//aws/s3/{bucket}/{path}```

#### FeatureGroups

Example url:

```//feast/host/{namespace}/{featuregroup}```

###  DataTransformers

```yaml
    DataTransformer:
        type: object
        properties:
            oddrn:
                example: //aws/glue/{account_id}/{database}/{tablename}
                type: string
            name:
                type: string
            owner:
                example: //aws/iam/{account_id}/user/name
                type: string
            description:
                type: string
            sourceCodeUrl:
                type: string
            sql:
                type: string                        
            inputs:
                type: array
                items:
                    type: string            
            outputs:
                type: array
                items:
                    type: string
            subtype:
                type: string
                enum: 
                - DATATRANSFORMER_JOB
                - DATATRANSFORMER_EXPERIMENT
                - DATATRANSFORMER_ML_MODEL_TRAINING
        required:
        - description
        - inputs
        - outputs
        - subtype
```

#### ETL jobs

Example url: //airflow/{host}/{path}/{dag_id}/{job_id}  

#### ML Training jobs

Example url: kubeflow://{host}/{path}/{job_id}

### DataConsumers

```yaml
    DataConsumer:
        type: object
        properties:
            description:
                type: string
            inputs:
                type: array
                items: 
                    type: string
            subtype:
                type: string
                enum: 
                - DATACONSUMER_DASHBOARD
                - DATACONSUMER_ML_MODEL               
          required:
            - description

```

#### ML Models

Example url: ```//aws/sagemaker/{account_id}/{model_id}```

#### BI dashboards

Example url: ```//tableu/{host}/{path}/{dashboard_id}```

### DataSetQualityTests

```yaml
    DataQualityTestExpectation:
      type: object
      properties:
        type:
          type: string
          example: "expect_table_row_count_to_be_between"
      additionalProperties:
        type: string

    DataQualityTest:
      type: object
      properties:
        suite_name:
          type: string
        test_name:
          type: string
        dataset_list:
          type: array
          items:
            type: string
        expectation:
          $ref: '#/components/schemas/DataQualityTestExpectation'
        suite_url:
          type: string
        linked_url_list:
          type: array
          items:
            $ref: '#/components/schemas/LinkedUrl'
      required:
        - test_name
        - suite_name
        - expectation
        - dataset_list

    DataQualityTestRun:  
        type: object
        properties:
            dataQualityTestOddrn:
              type: string
            startTime:
              type: string
              format: date-time
            endTime:        
              type: string
              format: date-time
            statusReason:
              type: string
            status:
              type: string
              enum:
                - SUCCESS
                - FAIL
                - ABORTED
                - OTHER
        required:
            - dataQualityTestOddrn
            - startTime
            - endTime
            - status

```

