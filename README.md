
<p> 
<img src="./images/open-data-discovery-platform-odd-logo.png" width="600px" alt="open-data-discovery-logo"/>&nbsp;
</p>

<br>

[![Apache2](https://img.shields.io/badge/license-Apache2-green.svg?style=for-the-badge)](https://www.apache.org/licenses/LICENSE-2.0)
[![Maintenance](https://img.shields.io/maintenance/yes/2022?style=for-the-badge)]()
[![GitHub contributors](https://img.shields.io/github/contributors/opendatadiscovery/odd-platform?style=for-the-badge)](https://github.com/opendatadiscovery/odd-platform/graphs/contributors)
[![Slack](https://img.shields.io/badge/chat-on_slack-purple.svg?style=for-the-badge&logo=slack)](https://go.opendatadiscovery.org/slack)
[![GitHub issues by-label](https://img.shields.io/github/issues/opendatadiscovery/odd-platform/good%20first%20issue?style=for-the-badge)](https://github.com/opendatadiscovery/odd-platform/contribute)

<br>

# Open Data Discovery Platform: Next-Gen Data Discovery and Observability 

<br>

## Introduction

ODD is an open-source data discovery and observability tool for data teams that helps to efficiently democratise data, power collaboration and reduce time on data discovery through modern user-friendly environment. 

### Key wins

* Shorten data discovery phase
* Have transparency on how and by whom the data is used
* Foster data culture by continuous compliance and data quality monitoring
* Accelerate data insights
* Know the sources of your dashboards and ad hoc reports
* Deprecate outdated objects responsibly by assessing and mitigating the risks


* :point_right: ODD Platform is a reference implementation of **[Open Data Discovery Spec](https://github.com/opendatadiscovery/opendatadiscovery-specification)**.


<br>

## Features

### Data Discovery and Observability

* Accumulate scattered data insights in Federated Data catalogue
* Gain observability through E2E Data objects Lineage
* Benefit from cutting-edge E2E microservices Lineage feature in tracking your data flow through the whole data landscape
* Be warned and alerted by Pipeline Monitoring tools
* Store your metadata 
* Use ODD-native modern lightweight UI


### ML First citizen

* Save results of your ML Experiments by automatically logging its parameters  


### Data Security & Compliance

* Manage Tags and Labels to prevent any abuse of the data
* Refer to Tags and Labels to stay compliant with data security standards
* Have full transparency on how and by whom the data is used


### Data Quality 

* Simplify DQ processes by using ODD and Great Expectations compatibility 
* Integrate ODD with any custom DQ framework


## Getting Started 

### Running Locally with Docker Compose

**```docker-compose -f docker/demo.yaml up -d```** 

* :point_right: **[QUICKSTART](./docker/README.md)** 

### Deploying to Kubernetes with Helm Charts

* :point_right: **[QUICKSTART](https://github.com/opendatadiscovery/charts/blob/master/QUICKSTART.md)**

### Example configurations

There are various example configurations (via docker-compose) within **[docker/examples directory](https://github.com/opendatadiscovery/odd-platform/tree/main/docker/examples)**.

<br>

## Contributing

Contributing to ODD Platform is very welcome. For basic contributions, all you need is being comfortable with GitHub and Git. The best ways to contribute are: 
* Work on new adapters 
* Work on documentation

To ensure equal and positive communication, we adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md). Before starting any interactions with this repository, please read it and make sure to follow. 

Please before contributing check out our [Contributing Guide](./CONTRIBUTING.md) and issues labeled "good first issue": 

[![GitHub issues by-label](https://img.shields.io/github/issues/opendatadiscovery/odd-platform/good%20first%20issue?style=for-the-badge)](https://github.com/opendatadiscovery/odd-platform/contribute)

<br>

## Integrations


ODD Platform works with many of the tools you're already using and is actively developing new integrations. 

Exisiting integrations: 
<table>
	<thead>
		<tr>
			<th colspan="2">Integration</th>
			<th>Entities ODD Gathers Metadata From</th>
		</tr>
	</thead>
	<tbody>
				<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/apache-airflow-logo.jpg" />            </td><td style="width: 200px;"><a href="https://github.com/opendatadiscovery/odd-airflow-adapter">Airflow</a></td><td>Transformers, Transformer Runs</td></tr>
				<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/dbt-logo.jpg" /></td><td style="width: 200px;"><a href="https://github.com/opendatadiscovery/odd-dbt-adapter">DBT</a></td><td>Datasets, Transformers, Transformer Runs</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/amazon-glue-logo.jpg" />                             </td><td style="width: 200px;"><a href="https://github.com/opendatadiscovery/odd-glue-adapter">AWS Glue</a></td><td>Datasets, Transformers, Transformer Runs</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://www.snowflake.com/wp-content/themes/snowflake/img/snowflake-logo-blue@2x.png" /> </td><td style="width: 200px;"><a href="https://github.com/opendatadiscovery/odd-snowflake-adapter">Snowflake</a></td><td>Datasets, Transformers</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/amazon-redshift-logo.jpg" /></td><td style="width: 200px;"><a href="https://github.com/opendatadiscovery/odd-redshift-adapter">Redshift</a></td><td>Datasets, Transformers</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/clickhouse-logo.jpg" />                   </td><td style="width: 200px;"><a href="https://github.com/opendatadiscovery/odd-clickhouse-adapter">Clickhouse</a></td><td>Datasets, Transformers</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/postgresql-logo.jpg" />                    </td><td style="width: 200px;"><a href="https://github.com/opendatadiscovery/odd-postgresql-adapter">PostgreSQL</a></td><td>Datasets, Transformers</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/mysql-logo.jpg" />          </td><td style="width: 200px;"><a href="https://github.com/opendatadiscovery/odd-mysql-adapter">MySQL</a></td><td>Datasets, Transformers</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/mssql-server-logo.jpg" />             </td><td style="width: 200px;"><a href="https://github.com/opendatadiscovery/odd-mssql-adapter">MSSQL</a></td><td>Datasets, Transformers coming soon</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/microsoft-odbc-logo.jpg" /></td><td style="width: 200px;"><a href="https://github.com/opendatadiscovery/odd-odbc-adapter">Microsoft ODBC</a></td><td>Datasets, Transformers</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/dynamodb-logo.jpg" /></td><td style="width: 200px;"><a href="https://github.com/opendatadiscovery/odd-dynamodb-adapter">DynamoDB </a></td><td>Datasets</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/apache-kafka-logo.jpg" />                 </td><td style="width: 200px;"><a href="https://github.com/opendatadiscovery/odd-kafka-adapter">Kafka</a></td><td>Datasets</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/tableau-logo.jpg" />                       </td><td style="width: 200px;"><a href="https://github.com/opendatadiscovery/odd-tableau-adapter">Tableau </a></td><td>Datasets, Consumers</td></tr>


</table>

<br>
Coming soon: 

<table>
	<thead>
		<tr>
			<th colspan="2">Integration</th>
			<th>Entities ODD Gathers Metadata From</th>
		</tr>
	</thead>
	<tbody>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/apache-hive-logo.jpg" />                                             </td><td style="width: 200px;">Apache Hive        </td><td>Datasets</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/kubeflow-logo.jpg" />            </td><td style="width: 200px;">Kubeflow                   </td><td>Transformers, Transformer Runs</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/amazon-sagemaker-logo.jpg" />            </td><td style="width: 200px;">SageMaker                   </td><td>Datasets</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/oracle-logo.jpg" />            </td><td style="width: 200px;">Oracle                   </td><td>Datasets, Transformers</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/dvc-logo.jpg" />            </td><td style="width: 200px;">DVC                </td><td>Transformers, Transformer Runs</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/apache-spark-logo.jpg" />            </td><td style="width: 200px;">Spark               </td><td>Transformers, Transformer Runs</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/great-expectations-logo.jpg" />            </td><td style="width: 200px;">Great Expectations               </td><td>Transformers, Transformer Runs</td></tr>
		<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/blob/main/images/great-expectations-logo.jpg" />            </td><td style="width: 200px;">Great Expectations               </td><td>Transformers, Transformer Runs</td></tr>
	</tbody>
</table>

<br>

<table>
	<thead>
		<tr>
			<th colspan="2">Existing integrations</th>
		</tr>
	</thead>
	<tbody>
	<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/amazon-athena-logo.png" />                                             </td><td style="width: 200px;"><a href="https://github.com/opendatadiscovery/odd-collector-aws#athena">Athena</a>        </td>
	<tr><td style="text-align: center; height=40px;"><img height="40" src="https://github.com/opendatadiscovery/odd-platform/images/cassandra-logo.jpeg" />                                             </td><td style="width: 200px;"><a href="https://github.com/opendatadiscovery/odd-collector-aws#athena">Cassandra</a>        </td>
		</tbody>
</table>

## ODD Data Model

ODD operates the following high-level types of entities:

<ol>
<li><b>Datasets </b>(collections of data: tables, topics, files, feature groups)</li>
<li><b>Transformers </b>(transformers of data: ETL or ML training jobs, experiments)</li> 
<li><b>Data Consumers </b>(data consumers: ML models or BI dashboards)</li> 
<li><b>Data Quality Tests </b>(data quality tests for datasets)</li> 
<li><b>Data Inputs </b>(sources of data)</li>
<li><b>Transformer Runs </b>(executions of ETL or ML training jobs)</li>
<li><b>Quality Test Runs </b>executions of data quality tests</li> 
</ol>

For more information, please check **[specification.md](https://github.com/opendatadiscovery/opendatadiscovery-specification/blob/main/specification/specification.md)**.

<br>

## Contacts

If you have any questions or ideas, please don't hesitate to drop a line to any of us. 


| Team Member               | LinkedIn                                      	                              | GitHub                                              |
|---------------------------|------------------------------------------------------------------------------|-----------------------------------------------------|
| German Osin               | [LinkedIn](https://www.linkedin.com/in/german-osin-47a9339/)      	          | [germanosin](https://github.com/germanosin)         |
| Nikita Dementev           | [LinkedIn](https://www.linkedin.com/in/nikita-dementev/)                     | [DementevNikita](https://github.com/DementevNikita) |
| Damir Abdullin            | [LinkedIn](https://www.linkedin.com/in/dabdullin/)                           | [damirabdul](https://github.com/damirabdul)         |
| Alexey Kozyurov           | [LinkedIn](https://www.linkedin.com/in/alexey-kozyurov-1823b1219/)           | [Leshe4ka](https://github.com/Leshe4ka)             |
| Pavel Makarichev          | [LinkedIn](https://www.linkedin.com/in/pavel-makarichev-8a8730a4/)           | [vixtir](https://github.com/vixtir)                 |
| Anna Evdokimova-Glinskaia | [LinkedIn](https://www.linkedin.com/in/anna-evdokimova-glinskaya-6566b5188/) | [Anna-EG](https://github.com/Anna-EG)               |
| Roman Zabaluev            | [LinkedIn](https://www.linkedin.com/in/haarolean/)                           | [Haarolean](https://github.com/haarolean)           |
## License

ODD Platform uses the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0.txt).
