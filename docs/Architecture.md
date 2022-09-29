# Architecture

The diagram below contains the structure of the Platform and shows principles of data exchange between ODD and your in-house components.

![](.gitbook/img/architecture\_collector.png)

**Push-client** is a provider which sends information directly to the central repository of the Platform. Also [read](https://github.com/opendatadiscovery/opendatadiscovery-specification/blob/main/specification/specification.md#push-model) about a push-strategy.

**ODD Collector** is a lightweight service which gathers metadata from all your data sources:

* It manages your metadata according to the [Specification](https://github.com/opendatadiscovery/opendatadiscovery-specification/blob/main/specification/specification.md).
* It connects to all your data sources simultaneously and provides configurable scheduling.

**ODDRN** (Open Data Discovery Resource Name) is a unique resource name that identifies entities such as data sources, data entities, dataset fields etc. It is used to built lineage and update metadata.
