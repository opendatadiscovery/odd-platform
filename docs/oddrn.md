
## ODDRN to built lineage
If you want to injest custom entities and then add them to a lineage diagram, use the [ODD model](https://pypi.org/project/odd-models/).

follow these steps:

Step 1 retrieve ODDRNs of your data entity:
1. Go to the main page of the data entity 
\\\\screen
2. On the right panel, copy the ODDRN

Step 2. Add ODDRN into the model

Example:
```
    DataEntity(
        oddrn=f"//airflow/example/job/{dag_id}",
        name=dag_id,
        type=DataEntityType.JOB,
        data_transformer=DataTransformer(
            inputs=[
                '<oddrn1>',
                '<oddrn2>',
            ],
            outputs=[
                '<oddrn3>',
                '<oddrn4>',
            ],
        ),
    )
```

## ODDRN generator
If you apply a custom collector or a run custom script. Postgresql example:

```
# postgresql
from oddrn_generator import PostgresqlGenerator

oddrn_gen = PostgresqlGenerator(
    host_settings='my.host.com',
    schemas='schema_name', databases='database_name', tables='table_name'
)

oddrn_gen.base_oddrn
# //postgresql/host/my.host.com
oddrn_gen.available_paths
# ('schemas', 'databases', 'tables', 'columns')

oddrn_gen.get_data_source_oddrn()
# //postgresql/host/my.host.com:5432/schemas/schema_name/databases/database_name

oddrn_gen.get_oddrn_by_path("schemas")
# //postgresql/host/my.host.com:5432/schemas/schema_name

oddrn_gen.get_oddrn_by_path("databases")
# //postgresql/host/my.host.com:5432/schemas/schema_name/databases/database_name

oddrn_gen.get_oddrn_by_path("tables")
# //postgresql/host/my.host.com:5432/schemas/schema_name/databases/database_name/tables/table_name

# you can set or change path:
oddrn_gen.set_oddrn_paths(tables='another_table_name', columns='new_column_name')
oddrn_gen.get_oddrn_by_path("columns")
# //postgresql/host/my.host.com:5432/schemas/schema_name/databases/database_name/tables/another_table_name/columns/new_column_name

# you can get path wih new values:
oddrn_gen.get_oddrn_by_path("columns", new_value="another_new_column_name")
# //postgresql/host/my.host.com:5432/schemas/schema_name/databases/database_name/tables/another_table_name/columns/another_new_column_name
```