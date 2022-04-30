import glob
import json
import os
from typing import Union, Dict, Any, Tuple

import requests


def create_data_source_and_retrieve_token(ds: Dict[str, Union[str, bool]]) -> str:
    response = requests.post(
        url=f"{platform_host_url}/api/datasources",
        json=ds,
        headers={"Content-Type": "application/json"}
    )

    if response.status_code != 200:
        raise Exception(f"Couldn't create data source {ds}")

    return response.json()['token']['value']


def inject_data(data: Dict[str, Any], token: str):
    response = requests.post(
        url=f"{platform_host_url}/ingestion/entities",
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
        json=data
    )

    if response.status_code != 200:
        raise Exception(f"Couldn't inject data for {data['data_source_oddrn']}")


def read_sample(json_filename: str) -> Tuple[str, Dict[str, Any]]:
    with open(json_filename, "r") as f:
        ingest_sample = json.loads(f.read())
        return ingest_sample['data_source_oddrn'], ingest_sample


platform_host_url = os.environ["PLATFORM_HOST_URL"]

data_sources = [
    {
        "name": "BookShop Transactional",
        "oddrn": "//postgresql/host/1.2.3.4/databases/bookshop",
        "description": "Transactional BookShop PostgreSQL database",
        "namespace_name": "Transactional",
        "connection_url": "",
        "active": True
    },
    {
        "name": "BookShop Data Lake",
        "oddrn": "//redshift/host/4.3.2.1/databases/data_lake/tables/sales_denorm",
        "description": "BookShop Data Lake cited in the Redshift",
        "namespace_name": "Data Lake",
        "active": True,
        "pulling_interval": "60",
        "connection_url": ""
    },
    {
        "name": "Snowflake Sample Data",
        "oddrn": "//snowflake/host/abcxyz.eu-central-1.snowflakecomputing.com/warehouses/COMPUTE_WH",
        "description": "Snowflake sample data from the free trial",
        "namespace_name": "Samples",
        "active": True,
        "pulling_interval": "60",
        "connection_url": ""
    },
    {
        "name": "Great Expectation",
        "oddrn": "//ge",
        "description": "Data quality processes over Snowflake data",
        "namespace_name": "Data Quality",
        "active": True,
        "pulling_interval": "60",
        "connection_url": ""
    },
    {
        "name": "Airflow ETL",
        "oddrn": "//airflow/host/aws.airflow.aws.com/",
        "description": "ETL for Sample Data Lake",
        "namespace_name": "ETL",
        "active": True,
        "pulling_interval": 60,
        "connection_url": ""
    },
    {
        "name": "BookShop ETL",
        "oddrn": "//airflow/host/2.1.3.4",
        "description": "Airflow ETL DAGs",
        "namespace_name": "ETL",
        "active": True,
        "pulling_interval": "60",
        "connection_url": ""
    },
    {
        "name": "User Transactions",
        "oddrn": "//kafka/host/aws.kafka.connect.io/",
        "description": "Kafka topics for user transactions data sample",
        "namespace_name": "Messaging",
        "active": True,
        "pulling_interval": "60",
        "connection_url": ""
    },
    {
        "name": "Data Lake S3",
        "oddrn": "//s3/cloud/aws/account/111111111111/region/us-west-2",
        "description": "S3 Data Lake for samples",
        "namespace_name": "Data Lake",
        "active": True,
        "pulling_interval": "60",
        "connection_url": ""
    },
    {
        "name": "Kinesis Data Stream consumer",
        "oddrn": "//microservice/named",
        "description": "KDS Consumer that pushes data from KDS to the S3 Data Lake",
        "namespace_name": "ETL",
        "active": True,
        "pulling_interval": "60",
        "connection_url": ""
    },
    {
        "name": "KDS Clickstream",
        "oddrn": "//kinesis/cloud/aws/account/111111111111/region/us-west-2/",
        "namespace_name": "Messaging",
        "active": True,
        "pulling_interval": "60",
        "connection_url": ""
    },
]

data_sources_grouped = {ds["oddrn"]: ds for ds in data_sources}

ingestion_samples_grouped = {
    sample[0]: sample[1]
    for sample in [
        read_sample(json_filename) for json_filename in glob.glob("./samples/*.json")
    ]
}

for oddrn, ds in ingestion_samples_grouped.items():
    ds_form = data_sources_grouped.get(oddrn)
    if not ds_form:
        print(f"Skipping {oddrn}. Define DataSourceFormData in order to inject from the json file")
        continue

    ds_token = create_data_source_and_retrieve_token(ds_form)
    inject_data(ds, ds_token)
    print(f"{oddrn}: Data source has been injected with JSON sample")
