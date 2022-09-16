## ODDRN: default state
By default, ODDRN is generated automatically as a unique id of a data entity.

link to a spec??
collector_config.yaml ??

To retrieve ODDRNs of your data entities:
1. Go to the main page of the data entity (https://platform.dev.odd.provectus.io/dataentities/{entity ID}/overview).
2. On the right panel, copy the ODDRN
3. ??? 
tip: why do we need oddrn?

## ODDRN for a custom integration
If you apply a custom collector or a run custom script:
```
# postgresql
from oddrn_generator import PostgresqlGenerator

oddrn_gen = PostgresqlGenerator(
    host_settings='my.host.com:5432',
    schemas='schema_name', databases='database_name', tables='table_name'
)

oddrn_gen.base_oddrn
# //postgresql/host/my.host.com:5432
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