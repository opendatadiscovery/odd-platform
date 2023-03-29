---
description: ODDRN — what is it and why we are using it?
---

# ODDRN

## Overview

**ODDRN** (**Open Data Discovery Resource Name**) is a unique string used to define and identify data entities, whether they are regular data entities, data sources, or dataset fields. To collect metadata, agents (which can be either ODD Collectors or custom scripts) must define the ODDRN for every data entity included in the payload. This ensures that each data entity can be easily identified and searched for in the future, streamlining data discovery and access processes.

## Format

All ODDRNs are structured consistently. They begin with a double slash and the name of the data source, followed by information that uniquely identifies this data source in the world. For example, PostgreSQL would include host information in the ODDRN, while AWS services would include an AWS account ID and region code (if necessary). Overall, the format typically follows REST URL conventions.

## Usage

ODDRN is an essential component of the ODD Platform. It allows for efficient handling of Ingestion API payloads by providing a standardized way of referring to specific entities. By utilizing ODDRNs, the platform is able to determine whether to create new entities, update existing, or delete obsolete ones. This results in a more effective data management process, ensuring that the platform is able to handle large volumes of data with ease and accuracy.

When using the ODD Platform and ODD Collectors, end users typically do not need to concern themselves with the ODDRNs of data entities or dataset fields, as these are created and handled automatically. However, in cases where custom or self-written agents are used, the developer of the agent must consider how to create ODDRNs. To assist with this, the OpenDataDiscovery infrastructure provides open source libraries for [Python](https://pypi.org/project/oddrn-generator/) and [Java](https://mvnrepository.com/artifact/org.opendatadiscovery/oddrn-generator-java) that help create ODDRNs within the agent.

## Known limitations

ODD Platform requires consumers of the Ingestion API (ODD Collectors and self-written agents) to use the **same** ODDRN strings for the **same** entities. Since ODDRNs generally consist of connection information to data sources, this requirement leads to the need to pass the same DNS or static IP to different agents that report on the same data infrastructure.

## Examples

ODDRN for a PostgreSQL table would look like this:

```
//postgresql/host/1.2.3.4/databases/ex_database/schemas/public/table/ex_table
```

where:

* `1.2.3.4` — PostgreSQL's instance host
* `ex_database` — PostgreSQL's target database
* `public` — PostgreSQL's target schema in the `ex_database` database
* `ex_table` — PostgreSQL's target table in the `public` schema of the `ex_database` database
