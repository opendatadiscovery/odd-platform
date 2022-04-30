import os

import requests

platform_host_url = os.environ['PLATFORM_HOST_URL']

data_sources = [
    {
        'name': 'BookShop Transactional',
        'oddrn': '//postgresql/host/1.2.3.4/databases/bookshop',
        'description': 'Transactional BookShop PostgreSQL database',
        'namespace_name': 'Transactional',
        'active': True
    },
    {
        'name': 'BookShop Data Lake',
        'oddrn': '//redshift/host/4.3.2.1/databases/data_lake/tables/sales_denorm',
        'description': 'BookShop Data Lake cited in the Redshift',
        'namespace_name': 'Data Lake',
        'active': True
    },
    {
        'name': 'Airflow ETL',
        'oddrn': '//airflow/host/aws.airflow.aws.com/',
        'description': 'ETL for Sample Data Lake',
        'namespace_name': 'ETL',
        'active': True
    },
    {
        'name': 'BookShop ETL',
        'oddrn': '//airflow/host/2.1.3.4',
        'description': 'Airflow ETL DAGs',
        'namespace_name': 'ETL',
        'active': True
    },
    {
        'name': 'Snowflake Sample Data',
        'oddrn': '//snowflake/host/abcxyz.eu-central-1.snowflakecomputing.com/warehouses/COMPUTE_WH',
        'description': 'Snowflake sample data from the free trial',
        'namespace_name': 'Samples',
        'active': True
    },
    {
        'name': 'Snowflake Sample Data',
        'oddrn': '//snowflake/host/abcxyz.eu-central-1.snowflakecomputing.com/warehouses/COMPUTE_WH',
        'description': 'Snowflake sample data from the free trial',
        'namespace_name': 'Samples',
        'active': True
    },
    {
        'name': 'Great Expectation',
        'oddrn': '//ge',
        'description': 'Data quality processes over Snowflake data',
        'namespace_name': 'Data Quality',
        'active': True
    },
    {
        'name': 'User Transactions',
        'oddrn': '//kafka/host/aws.kafka.connect.io/',
        'description': 'Kafka topics for user transactions data sample',
        'namespace_name': 'Messaging',
        'active': True
    },
]

data_sources_grouped = {ds['oddrn']: ds for ds in data_sources}

for ds in data_sources:
    res = requests.post(url=platform_host_url, data=ds)
    print(res)
