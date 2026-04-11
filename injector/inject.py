import glob
import json
import os
import requests
import time
from typing import Union, Dict, Any, Tuple, List

REACH_TRIES_NUMBER = 20
SAMPLE_PATH = os.getenv("SAMPLE_PATH") or "/samples"
DATA_SOURCES_ONLY = os.getenv("DATA_SOURCES_ONLY") or False

platform_host_url = os.environ["PLATFORM_HOST_URL"]
print(f"Platform host url: {platform_host_url}")


def read_sample_json(json_filename: str) -> Tuple[str, Dict[str, Any]]:
    with open(json_filename, "r") as f:
        ingest_sample = json.loads(f.read())
        return ingest_sample['data_source_oddrn'], ingest_sample


def read_datasources_json() -> List[Dict[str, Any]]:
    with open(f"{SAMPLE_PATH}/datasources/datasources.json", "r") as f:
        return json.loads(f.read())


def fetch_existing_datasources() -> List[Dict[str, Any]]:
    response = requests.get(
        url=f"{platform_host_url}/api/datasources?page=1&size=1000",
    )

    if response.status_code != 200:
        raise Exception(f"Couldn't fetch data sources")

    return response.json()['items']


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


data_sources_grouped = {ds["oddrn"]: ds for ds in read_datasources_json()}

healthy = False
for i in range(0, REACH_TRIES_NUMBER):
    print(f"Waiting for the platform to be able to receive requests: {REACH_TRIES_NUMBER - i}")

    try:
        hc_response = requests.get(f"{platform_host_url}/actuator/health")
    except requests.exceptions.ConnectionError:
        print("Couldn't reach the platform")
        time.sleep(2)
        continue

    if hc_response.json().get('status') != 'UP':
        print("Platform's not healthy yet")
        time.sleep(2)
        continue

    healthy = True
    break

if not healthy:
    raise Exception(f"Couldn't reach the platform in {REACH_TRIES_NUMBER} tries")

print("Starting to injecting metadata")
existing_datasources_grouped = {ds['oddrn']: ds for ds in fetch_existing_datasources()}

payload_files = sorted(glob.glob(f"{SAMPLE_PATH}/samples/*.json"))

for payload_file in payload_files:
    ds_oddrn, metadata = read_sample_json(payload_file)
    ds_form = data_sources_grouped.get(ds_oddrn)
    if not ds_form:
        print(f"Skipping {ds_oddrn}. Define DataSourceFormData in order to inject from the json file")
        continue

    ds_token = "None"
    if ds_form['oddrn'] in existing_datasources_grouped:
        print(f"Data source already exists: {ds_form}")
    else:
        ds_token = create_data_source_and_retrieve_token(ds_form)
        print(f"{ds_oddrn}: Data source has been created")

    if not DATA_SOURCES_ONLY:
        try:
            inject_data(metadata, ds_token)
            print(f"{ds_oddrn}: Data source has been injected with JSON sample from {payload_file}")
        except:
            print(f"Couldn't inject data for {ds_oddrn} from {payload_file}. "
                  f"Possibly the 'ingestion.filter.enabled' property is set to 'true'")
