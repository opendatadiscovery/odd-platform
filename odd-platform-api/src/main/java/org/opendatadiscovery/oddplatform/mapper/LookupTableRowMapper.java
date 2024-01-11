package org.opendatadiscovery.oddplatform.mapper;

import java.util.ArrayList;
import java.util.List;
import org.jooq.Field;
import org.jooq.Record;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableRow;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableRowColumnData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableRowList;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

@Component
public class LookupTableRowMapper {
    public LookupTableRow mapRecordToLookupTableRow(final Record record,
                                                    final List<LookupTablesDefinitionsPojo> fields) {
        final List<LookupTableRowColumnData> row = new ArrayList<>();
        Long rowId = null;

        for (final LookupTablesDefinitionsPojo column : fields) {
            final Field<?> field = record.field(column.getColumnName().toLowerCase());

            if (field == null || record.getValue(field) == null) {
                row.add(new LookupTableRowColumnData()
                    .fieldId(column.getId())
                    .value(null));
                continue;
            }

            final String value = record.getValue(field).toString();

            if (column.getIsPrimaryKey()) {
//               Currently, all primary keys have Long type
                rowId = Long.valueOf(value);
            }

            row.add(new LookupTableRowColumnData()
                .fieldId(column.getId())
                .value(value));
        }

        return new LookupTableRow()
            .rowId(rowId)
            .items(row);
    }

    public LookupTableRowList mapPagesToLookupTableRowList(final Page<LookupTableRow> pages) {
        return new LookupTableRowList()
            .items(pages.getData())
            .pageInfo(new PageInfo().total(pages.getTotal()).hasNext(pages.isHasNext()));
    }
}
