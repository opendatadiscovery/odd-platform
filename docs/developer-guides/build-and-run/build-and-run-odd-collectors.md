---
description: Developer guide on how to build and run ODD Collectors
---

# Build and run ODD Collectors

For instructions on how to run the ODD Platform and ODD Collectors locally in a Docker environment, please follow [Try locally](../../configuration-and-deployment/trylocally.md) article.&#x20;

## ODD Collectors tech stack

There are 3 main collectors at the moment:

* ****[**ODD Collector**](https://github.com/opendatadiscovery/odd-collector) **** — covering databases, BI tools, data warehouses, etc
* ****[**ODD Collector AWS**](https://github.com/opendatadiscovery/odd-collector-aws) — covering AWS services
* ****[**ODD Collector GCP**](https://github.com/opendatadiscovery/odd-collector-gcp) **** — covering GCP services

While ODD Collector AWS and ODD Collector GCP use [boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) and Google SDKs respectively, ODD Collector has a bunch dependencies for each data source.

General tech stack is:

* Python
* Poetry
* asyncio

## Prerequisites

* Python 3.9.1
* [Poetry](https://python-poetry.org/) 1.2.0
* [Docker Engine 19.03.0+](https://docs.docker.com/engine/install/)
* preferably the latest [docker-compose](https://docs.docker.com/compose/install/)

## Build ODD Collector into Docker container

Fork and clone a repository if you haven't done it already.

```shell
git clone https://github.com/{username}/odd-collector.git
```

Go into the repository's root directory

```shell
cd odd-collector
```

Run the following command, replacing `<tag>` with any tag name you'd like

```shell
docker build . -t odd-collector:<tag>
```

## Run ODD Collector locally

### Run ODD Platform locally as a target for ODD Collector

In order to run ODD Platform locally please follow [this guide](../../configuration-and-deployment/trylocally.md).

### Activate environment

Go into the repository's root directory

```shell
cd odd-collector
```

Run following commands to create local python environment and install dependencies

```shell
poetry install
```

Change your python context to created one.

```shell
poetry shell
```

### Configure ODD Collector to send request to target catalog

Create collector in the ODD Platform and copy created token using [this guide](../../configuration-and-deployment/trylocally.md#create-collector-entity).

Configure `collector-config.yaml` using [this](https://github.com/opendatadiscovery/odd-collector/tree/main/config\_examples) as an example. Replace `<COLLECTOR_TOKEN>` with token obtained in the previous step.

```yaml
default_pulling_interval: 10
token: <COLLECTOR_TOKEN>
platform_host_url: http://localhost:8080
plugins:
  - type: my_adapter
    some_field_one: str
    some_field_two: int
```

### Run ODD Collector

Run ODD Collector locally using following command:

```shell
sh ./start.sh
```

## How to implement new integration

### Create configuration entry for new integration

Add new integration plugin derived from `BasePlugin` and register it in `PluginFactory`

{% code title="domain/plugin.py" %}
```python
...
class MyAdapterPlugin(BasePlugin):
    type: Literal["my_adapter"]
    some_field_one: str
    some_field_two: int

...

PLUGIN_FACTORY: PluginFactory = {
    ...
    "my_adapter": MyAdapterPlugin,
}
```
{% endcode %}

### Implement new integration

Each adapter module (i.e `odd_collector.adapters.my_adapter`) must have `adapter.py` python file. That file must have class derived from `AbstractAdapter.`

{% code title="adapters/new_adapter/adapter.py" %}
```python
from odd_collector_sdk.domain.adapter import AbstractAdapter

class Adapter(AbstractAdapter):
    def __init__(
        self,
        config: MyAdapterPlugin
    ):
        ...

    def get_data_source_oddrn(self) -> str:
        ...

    async def get_data_entity_list(self) -> DataEntityList:
        ...
```
{% endcode %}

### Make pull request to the origin repository

Please use [this guide](../how-to-contribute.md#forking-a-repository) for making forks and pull requests

## Troubleshooting

### Running ODD Collector on M1

libraries `pyodbc` , `confluent-kafka` and `grpcio` have problem during installing and building project on M1 Macbooks.

* [mkleehammer/pyodbc#846](https://github.com/mkleehammer/pyodbc/issues/846)
* [confluentinc/confluent-kafka-python#1190](https://github.com/confluentinc/confluent-kafka-python/issues/1190)
* [grpc/grpc#25082](https://github.com/grpc/grpc/issues/25082)

Possible solution:

{% hint style="info" %}
The easiest way is to add all export statements to your .bashrc/.zshrc file
{% endhint %}

```shell
# pyodbc dependencies
brew install unixodbc freetds openssl

# cunfluent-kafka
export LDFLAGS="-L/opt/homebrew/lib  -L/opt/homebrew/Cellar/unixodbc/2.3.11/include -L/opt/homebrew/opt/freetds/lib -L/opt/homebrew/opt/openssl@3/lib"export CFLAGS="-I/opt/homebrew/Cellar/unixodbc/2.3.11/include -I/opt/homebrew/opt/freetds/include"export CPPFLAGS="-I/opt/homebrew/include -I/opt/homebrew/Cellar/unixodbc/2.3.11/include -I/opt/homebrew/opt/openssl@3/include"
brew install librdkafka
export C_INCLUDE_PATH=/opt/homebrew/Cellar/librdkafka/1.9.0/include
export LIBRARY_PATH=/opt/homebrew/Cellar/librdkafka/1.9.0/lib
export PATH="/opt/homebrew/opt/openssl@3/bin:$PATH"# grpcio
export GRPC_PYTHON_BUILD_SYSTEM_OPENSSL=1
export GRPC_PYTHON_BUILD_SYSTEM_ZLIB=1
```
