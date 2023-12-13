package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.jooq.AlterTableAlterStep;
import org.jooq.ConstraintEnforcementStep;
import org.jooq.CreateSequenceFlagsStep;
import org.jooq.CreateTableElementListStep;
import org.jooq.DDLQuery;
import org.jooq.DataType;
import org.jooq.Field;
import org.jooq.InsertValuesStepN;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.annotation.ReactiveCustomTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableRowColumnFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableRowFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableRowList;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnDto;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnTypes;
import org.opendatadiscovery.oddplatform.dto.LookupTableDto;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableColumnDto;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableDto;
import org.opendatadiscovery.oddplatform.exception.DatabaseException;
import org.opendatadiscovery.oddplatform.mapper.LookupTableRowMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperationsCustomTables;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.name;
import static org.jooq.impl.DSL.table;
import static org.jooq.impl.SQLDataType.INTEGER;

@Repository
@RequiredArgsConstructor
public class ReferenceDataRepositoryImpl implements ReferenceDataRepository {
    public static final String ID_COLUMN = "id";

    private final LookupTableRowMapper lookupTableRowMapper;
    private final JooqReactiveOperationsCustomTables jooqReactiveOperationsCustomTables;
    private final JooqQueryHelper jooqQueryHelper;

    @Override
    @ReactiveCustomTransactional
    public Mono<Void> createLookupTable(final ReferenceTableDto tableDto) {
        final CreateSequenceFlagsStep sequence =
            DSL.createSequence(tableDto.getTableName() + "_pk_sequence");
        final CreateTableElementListStep table =
            DSL.createTable(tableDto.getTableName())
                .column(ID_COLUMN, INTEGER.identity(true))
                .constraint(DSL.constraint().primaryKey(ID_COLUMN));

        return jooqReactiveOperationsCustomTables.mono(sequence)
            .then(jooqReactiveOperationsCustomTables.mono(table))
            .then(Mono.empty());
    }

    @Override
    @ReactiveCustomTransactional
    public Mono<Void> addColumnsToLookupTable(final String tableName, final List<ReferenceTableColumnDto> columnDtos) {
        final List<Field<?>> fields = new ArrayList<>();
        final List<ConstraintEnforcementStep> constraints = new ArrayList<>();

        for (final ReferenceTableColumnDto column : columnDtos) {
            DataType<?> dataType;

            if (StringUtils.isNotBlank(column.getDefaultValue())) {
                dataType = column.getDataType().getValidator()
                    .getDataTypeWithDefaultValue(column.getDefaultValue(), column.getName());
            } else {
                dataType = column.getDataType().getDataType();

                if (!column.isNullable()) {
                    dataType = dataType.notNull();
                }
            }

            fields.add(field(column.getName(), dataType));
            if (column.isUnique()) {
                constraints.add(DSL.constraint().unique(field(column.getName())));
            }
        }

        if (constraints.isEmpty()) {
            return jooqReactiveOperationsCustomTables.mono(DSL.alterTable(tableName).add(fields))
                .then(Mono.empty());
        } else {
            return jooqReactiveOperationsCustomTables.mono(DSL.alterTable(tableName).add(fields))
                .then(jooqReactiveOperationsCustomTables.mono(DSL.alterTable(tableName).add(constraints)))
                .then(Mono.empty());
        }
    }

    @Override
    public Mono<LookupTableRowList> addDataToLookupTable(final LookupTableDto table,
                                                         final List<LookupTableRowFormData> items) {
        final Table<Record> tableRecord = table(name(table.tablesPojo().getTableName()));

        final List<Pair<Field<Object>, LookupTablesDefinitionsPojo>> columnNames = table.definitionsPojos()
            .stream()
            .filter(item -> !item.getColumnName().equals(ID_COLUMN))
            .map(item -> Pair.of(field(name(item.getColumnName().toLowerCase())), item))
            .toList();

        final Field<?>[] fields = columnNames.stream()
            .map(Pair::getLeft)
            .toArray(Field[]::new);

        final InsertValuesStepN insertStep = DSL.insertInto(tableRecord, fields);

        for (final LookupTableRowFormData inputRow : items) {
            final Object[] rowToInsert = new Object[fields.length];
            boolean isAdded = false;
            for (int i = 0; i < columnNames.size(); i++) {
                final Pair<Field<Object>, LookupTablesDefinitionsPojo> field = columnNames.get(i);

                final LookupTableColumnTypes type = LookupTableColumnTypes
                    .resolveByTypeString(field.getValue().getColumnType());
                for (final LookupTableRowColumnFormData item : inputRow.getItems()) {
                    if (!field.getRight().getId().equals(item.getFieldId())) {
                        continue;
                    }

                    rowToInsert[i] =
                        DSL.val(type.getValidator().getValue(item.getValue(), field.getValue().getColumnName()),
                            type.getDataType());

                    isAdded = true;
                    break;
                }

                if (!isAdded) {
                    rowToInsert[i] = DSL.val(null, type.getDataType());
                }

                isAdded = false;
            }

            insertStep.values(rowToInsert);
        }

        return jooqReactiveOperationsCustomTables.mono(insertStep)
            .onErrorResume(exception -> Mono.error(new DatabaseException()))
            .then(getLookupTableRowList(table, 1, 50));
    }

    @Override
    public Mono<LookupTableRowList> getLookupTableRowList(final LookupTableDto table,
                                                          final Integer page,
                                                          final Integer size) {
        final List<Field<?>> fields = new ArrayList<>();

        for (final LookupTablesDefinitionsPojo column : table.definitionsPojos()) {
            fields.add(DSL.field(DSL.name(table.tablesPojo().getTableName(), column.getColumnName().toLowerCase())));
        }

        final Select<Record> homogeneousQuery = DSL.select(fields)
            .from(DSL.name("lookup_tables_schema", table.tablesPojo().getTableName()));

//      ID_COLUMN should always be in custom table
        final Select<? extends Record> select = jooqQueryHelper.paginate(homogeneousQuery,
            List.of(new OrderByField(field(ID_COLUMN), SortOrder.DESC)),
            (page - 1) * size, size);

        return jooqReactiveOperationsCustomTables.flux(select)
            .collectList()
            .flatMap(record -> jooqQueryHelper.pageifyResult(
                record,
                r -> lookupTableRowMapper.mapRecordToLookupTableRow(r, table.definitionsPojos()),
                fetchCount(table.tablesPojo().getTableName())
            ))
            .map(lookupTableRowMapper::mapPagesToLookupTableRowList);
    }

    @Override
    @ReactiveCustomTransactional
    public Mono<Void> updateLookupTable(final LookupTableDto table,
                                        final ReferenceTableDto dto) {
        return jooqReactiveOperationsCustomTables.mono(
                DSL.alterTable(table(DSL.name(table.tablesPojo().getTableName()))).renameTo(dto.getTableName()))
            .then(Mono.empty());
    }

    @Override
    @ReactiveCustomTransactional
    public Mono<Void> updateLookupTableColumn(final LookupTableColumnDto columnDto,
                                              final ReferenceTableColumnDto inputColumnInfo) {
        final LookupTablesDefinitionsPojo column = columnDto.columnPojo();
        final LookupTableColumnTypes type =
            LookupTableColumnTypes.resolveByTypeString(column.getColumnType());
        final String tableName = columnDto.tablesPojo().getTableName();

        DDLQuery renameQuery = null;
        if (!column.getColumnName().equals(inputColumnInfo.getName())) {
            renameQuery = DSL.alterTable(table(DSL.name(tableName)))
                .renameColumn(DSL.name(column.getColumnName().toLowerCase()))
                .to(DSL.name(inputColumnInfo.getName().toLowerCase()));
        }

        final String existedDefault = column.getDefaultValue();
        final String newDefault = inputColumnInfo.getDefaultValue();
        final AlterTableAlterStep<Object> alter = DSL.alterTable(tableName)
            .alterColumn(inputColumnInfo.getName().toLowerCase());
        DDLQuery updateQuery = null;

        if (isDefaultValueRequireUpdate(existedDefault, newDefault)) {
            if (StringUtils.isBlank(inputColumnInfo.getDefaultValue())) {
                updateQuery = alter.dropDefault();
            } else {
                updateQuery = alter.default_(DSL.inline(
                    type.getValidator().getValue(inputColumnInfo.getDefaultValue(), inputColumnInfo.getName()))
                );
            }
        } else if (!column.getIsNullable().equals(inputColumnInfo.isNullable())) {
            if (inputColumnInfo.isNullable()) {
                updateQuery = alter.dropNotNull();
            } else {
                updateQuery = alter.setNotNull();
            }
        }

        final Mono<Integer> renameOperation = renameQuery != null
            ? jooqReactiveOperationsCustomTables.mono(renameQuery)
            : Mono.empty();

        final Mono<Integer> updateOperation = updateQuery != null
            ? jooqReactiveOperationsCustomTables.mono(updateQuery)
            : Mono.empty();

        return renameOperation
            .then(updateOperation)
            .then(Mono.empty());
    }

    private static boolean isDefaultValueRequireUpdate(final String existedDefault, final String newDefault) {
        return (StringUtils.isBlank(existedDefault) && StringUtils.isNotBlank(newDefault))
            || (StringUtils.isNotBlank(existedDefault) && StringUtils.isBlank(newDefault))
            || (StringUtils.isNotBlank(existedDefault)
                && StringUtils.isNotBlank(newDefault)
                && !existedDefault.equals(newDefault)
            );
    }

    protected Mono<Long> fetchCount(final String tableName) {
        return jooqReactiveOperationsCustomTables
            .mono(DSL.selectCount().from(tableName))
            .map(r -> r.component1().longValue());
    }
}
