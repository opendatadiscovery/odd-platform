import glob
import json
import os
import requests
import sys
import time
from typing import Union, Dict, Any, Tuple, List


def env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        print(f"{name}={raw!r} is not a number, using {default}")
        return default


def env_flag(name: str) -> bool:
    # Anything other than an explicit truthy word is false. A plain
    # `os.getenv(name) or False` reads *any* non-empty string as true, so
    # DATA_SOURCES_ONLY=false used to mean "data sources only".
    return (os.getenv(name) or "").strip().lower() in ("1", "true", "yes", "on")


# A cold first start is slow: the platform applies its whole migration set
# against an empty database before it serves anything. Under docker-compose the
# enricher waits for the platform's healthcheck and this budget is never
# reached; it is what keeps the script safe when it is run on its own.
REACH_TRIES_NUMBER = env_int("REACH_TRIES_NUMBER", 60)
REACH_RETRY_DELAY_SECONDS = env_int("REACH_RETRY_DELAY_SECONDS", 5)
REACH_TIMEOUT_SECONDS = 5
SAMPLE_PATH = os.getenv("SAMPLE_PATH") or "/samples"
DATA_SOURCES_ONLY = env_flag("DATA_SOURCES_ONLY")

platform_host_url = os.environ["PLATFORM_HOST_URL"]
print(f"Platform host url: {platform_host_url}")


def read_sample_json(json_filename: str) -> Tuple[str, Dict[str, Any]]:
    with open(json_filename, "r") as f:
        ingest_sample = json.loads(f.read())
        return ingest_sample['data_source_oddrn'], ingest_sample


def read_datasources_json() -> List[Dict[str, Any]]:
    with open(f"{SAMPLE_PATH}/datasources/datasources.json", "r") as f:
        return json.loads(f.read())


def read_samples() -> List[Tuple[str, str, Dict[str, Any]]]:
    payload_files = sorted(glob.glob(f"{SAMPLE_PATH}/samples/*.json"))
    return [(payload_file,) + read_sample_json(payload_file) for payload_file in payload_files]


def validate_samples(samples: List[Tuple[str, str, Dict[str, Any]]],
                     data_sources: Dict[str, Dict[str, Union[str, bool]]]) -> None:
    # Every sample must name a data source that datasources.json defines: an
    # unmatched sample is never created and never injected, so the catalog ends
    # up quietly smaller than the sample set promises. The reverse is not an
    # error - a data source nothing references is unused, but it loses nothing.
    unknown = [(payload_file, ds_oddrn) for payload_file, ds_oddrn, _ in samples
               if ds_oddrn not in data_sources]

    if not unknown:
        return

    print("")
    print(f"{len(unknown)} of {len(samples)} samples name a data source that is not defined in "
          f"{SAMPLE_PATH}/datasources/datasources.json:")
    for payload_file, ds_oddrn in unknown:
        print(f"  - {payload_file} wants {ds_oddrn}")
    print("Nothing has been injected. Either add the data source or correct the sample's "
          "data_source_oddrn, then run again.")
    sys.exit(1)


def wait_until_healthy() -> None:
    for attempt in range(1, REACH_TRIES_NUMBER + 1):
        print(f"Waiting for the platform to be able to receive requests: "
              f"attempt {attempt} of {REACH_TRIES_NUMBER}")

        try:
            hc_response = requests.get(f"{platform_host_url}/actuator/health",
                                       timeout=REACH_TIMEOUT_SECONDS)
        except requests.exceptions.RequestException as e:
            print(f"Couldn't reach the platform: {e}")
            time.sleep(REACH_RETRY_DELAY_SECONDS)
            continue

        try:
            status = hc_response.json().get('status')
        except ValueError:
            # Still booting: something is listening, but it isn't the health endpoint yet.
            status = None

        if status == 'UP':
            return

        print(f"Platform's not healthy yet (HTTP {hc_response.status_code})")
        time.sleep(REACH_RETRY_DELAY_SECONDS)

    raise Exception(
        f"Couldn't reach the platform at {platform_host_url} in {REACH_TRIES_NUMBER} tries "
        f"(~{REACH_TRIES_NUMBER * REACH_RETRY_DELAY_SECONDS}s). A first start is slow because the "
        f"platform applies its whole database migration set against an empty database before it "
        f"serves anything - check the platform's own logs to see whether it is still starting. If "
        f"it simply needs longer here, raise REACH_TRIES_NUMBER or REACH_RETRY_DELAY_SECONDS."
    )


def fetch_existing_datasources() -> List[Dict[str, Any]]:
    response = requests.get(
        url=f"{platform_host_url}/api/datasources?page=1&size=1000",
    )

    if response.status_code != 200:
        raise Exception(f"Couldn't fetch data sources: HTTP {response.status_code} {response.text[:500]}")

    return response.json()['items']


def create_data_source_and_retrieve_token(ds: Dict[str, Union[str, bool]]) -> str:
    response = requests.post(
        url=f"{platform_host_url}/api/datasources",
        json=ds,
        headers={"Content-Type": "application/json"}
    )

    if response.status_code != 200:
        raise Exception(f"Couldn't create data source {ds}: "
                        f"HTTP {response.status_code} {response.text[:500]}")

    return response.json()['token']['value']


def inject_data(data: Dict[str, Any], token: str):
    response = requests.post(
        url=f"{platform_host_url}/ingestion/entities",
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
        json=data
    )

    if response.status_code != 200:
        raise Exception(f"HTTP {response.status_code} {response.text[:500]}")


data_sources_grouped = {ds["oddrn"]: ds for ds in read_datasources_json()}
samples = read_samples()

# Before the wait, not after: a sample set that cannot be delivered should cost a
# second, not the whole readiness budget.
validate_samples(samples, data_sources_grouped)

wait_until_healthy()

print("Starting to inject metadata")
existing_datasources_grouped = {ds['oddrn']: ds for ds in fetch_existing_datasources()}

failures: List[Tuple[str, str, str]] = []

for payload_file, ds_oddrn, metadata in samples:
    ds_form = data_sources_grouped[ds_oddrn]

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
        except Exception as e:
            failures.append((payload_file, ds_oddrn, str(e)))
            print(f"Couldn't inject data for {ds_oddrn} from {payload_file}: {e}")

if failures:
    print("")
    print(f"{len(failures)} of {len(samples)} samples were NOT injected - the catalog is incomplete:")
    for payload_file, ds_oddrn, error in failures:
        print(f"  - {payload_file} ({ds_oddrn}): {error}")
    print("The message above is the platform's own response. If it mentions authentication, check "
          "whether auth.ingestion.filter.enabled is on; the sample data carries no ingestion token.")
