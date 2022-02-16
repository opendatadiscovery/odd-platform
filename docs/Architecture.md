# Architecture
[Adapters](#adapters) \
[Push-client](#push-client) \
[Push and pull strategies](#push-and-pull-strategies) \
\
The diagram below contains the structure of the Platform and shows principles of data exchange between ODD and your in-house components.

![](.gitbook/img/architecture2.png)

### Adapters

Adapters are lightweight services that gather metadata in a standardized format. They are designed to be source-specific and expose only the information that could be gathered from a particular data source.

### Push-client

Push-clients are providers that send information directly to the central repository of the Platform.

## Push and pull strategies

The metadata discovery process is very similar to that of gathering metrics,logs and traces. It can be done through a pull or push model (or both). Each of the models has a range of use cases it suits best. ODD uses both models to effectively cover all core use cases.

### Pull strategy

Pulling metadata directly from the source is the most straightforward way of gathering it. However, an attempt to develop and maintain a centralized fleet of domain-specific crawlers can easily become a problem.\
Pulling data from multiple sources without having a standard compels to use multiple source-specific crawlers for each adapter, which is a complex and ineffective solution. ODD solves this issue by providing a universal adapter.\
Pull model is preferred when:
* There is no need to get immediate data updates.
* You have already applied one of ODD adapters to your data sources.

### Push strategy

Push strategy supports a process where individual metadata providers push the information to the central ODD repository. This strategy solves a problem of immediate data receiving from ETL / ELT engines that have no public APIs or if a data collecting function is not available through the existing API. The Push is more preferred for use cases like Airflow job runs and quality check runs.
