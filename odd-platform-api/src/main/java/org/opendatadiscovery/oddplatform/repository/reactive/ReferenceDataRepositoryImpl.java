package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.jooq.AlterTableAlterStep;
import org.jooq.ConstraintEnforcementStep;
import org.jooq.CreateSequenceFlagsStep;
import org.jooq.CreateTableElementListStep;
import org.jooq.DDLQuery;
import org.jooq.DataType;
import org.jooq.DropTableStep;
import org.jooq.Field;
import org.jooq.InsertValuesStepN;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
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
    private static final String ID_COLUMN = "id";
    private static final String SEQUENCE_NAME = "sequence_name";
    private static final String CONSTRAINT_NAME = "constraint_name";
    private static final String SCHEMA_NAME = "lookup_tables_schema";

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
            .from(DSL.name(SCHEMA_NAME, table.tablesPojo().getTableName()));

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
        final SelectConditionStep<Record1<String>> sequences =
            getSequencesByNameTemplate(table.tablesPojo().getTableName().concat("_%"));

        final SelectConditionStep<Record1<String>> constraints =
            getConstraintsByTableAndTemplateName(table.tablesPojo().getTableName(),
                table.tablesPojo().getTableName().concat("_%"));

        return jooqReactiveOperationsCustomTables.mono(
                DSL.alterTable(table(DSL.name(table.tablesPojo().getTableName()))).renameTo(dto.getTableName()))
            .thenMany(jooqReactiveOperationsCustomTables.flux(sequences))
            .flatMap(item -> jooqReactiveOperationsCustomTables.mono(DSL.alterSequenceIfExists(item.value1())
                .renameTo(item.value1().replace(table.tablesPojo().getTableName(), dto.getTableName()))))
            .thenMany(jooqReactiveOperationsCustomTables.flux(constraints))
            .flatMap(item -> jooqReactiveOperationsCustomTables.mono(DSL.alterTable(dto.getTableName())
                .renameConstraint(item.value1()).to(
                    item.value1().replace(table.tablesPojo().getTableName(), dto.getTableName())
                )))
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
        final DDLQuery renameQuery = getRenameQuery(inputColumnInfo, column, tableName);
        final DDLQuery updateQuery = getNullableAndDefaultValueUpdateQuery(inputColumnInfo, column, tableName, type);
        final Mono<?> uniqueQuery = getUniqueConstraintUpdateQuery(inputColumnInfo, column, tableName);
        Mono<?> renameSequenceAndConstraintsQuery = null;

        if (renameQuery != null) {
//        In case uniqueQuery is not null, you should not rename constraints because
//        We will create a unique constraint with new name
//        or we will remove the constraint.
            if (uniqueQuery == null) {
                renameSequenceAndConstraintsQuery =
                    renameConstraintUpdateQuery(inputColumnInfo.getName(), column, tableName);
//                        .then(renameSequencesUpdateQuery(inputColumnInfo.getName(), column, tableName));
            } else {
                renameSequenceAndConstraintsQuery =
                    renameSequencesUpdateQuery(inputColumnInfo.getName(), column, tableName);
            }
        }

        return (uniqueQuery != null ? uniqueQuery : Mono.empty())
            .then(getOperation(renameQuery))
            .then(getOperation(updateQuery))
            .then(renameSequenceAndConstraintsQuery != null ? renameSequenceAndConstraintsQuery : null)
            .then(Mono.empty());
    }

    @Override
    @ReactiveCustomTransactional
    public Mono<Void> deleteLookupTable(final LookupTableDto table) {
        final DropTableStep dropTableStep = DSL.dropTable(table.tablesPojo().getTableName());
        final SelectConditionStep<Record1<String>> sequences =
            getSequencesByNameTemplate(table.tablesPojo().getTableName().concat("_%"));

        return jooqReactiveOperationsCustomTables.mono(dropTableStep)
            .thenMany(jooqReactiveOperationsCustomTables.flux(sequences))
            .flatMap(item -> jooqReactiveOperationsCustomTables.mono(DSL.dropSequenceIfExists(item.value1())))
            .then(Mono.empty());
    }

    @Override
    @ReactiveCustomTransactional
    public Mono<Void> deleteLookupTableField(final LookupTableColumnDto field) {
        final String nameTemplate = buildSequenceNameTemplate(field.tablesPojo().getTableName(),
            field.columnPojo().getColumnName());

        final SelectConditionStep<Record1<String>> constraints =
            getConstraintsByTableAndTemplateName(field.tablesPojo().getTableName(), nameTemplate);

        final SelectConditionStep<Record1<String>> sequences =
            getSequencesByNameTemplate(nameTemplate);

        return dropColumnConstraints(constraints, field.tablesPojo().getTableName())
            .then(jooqReactiveOperationsCustomTables.mono(DSL.alterTable(field.tablesPojo().getTableName())
                .dropColumnIfExists(field.columnPojo().getColumnName().toLowerCase())))
            .then(mapConstraintOrSequenceRecordsToNames(sequences))
            .map(sequenceList -> sequenceList
                .stream()
                .map(sequence -> jooqReactiveOperationsCustomTables
                    .mono(DSL.dropSequenceIfExists(sequence))))
            .then(Mono.empty());
    }

    @Override
    @ReactiveCustomTransactional
    public Mono<Void> deleteLookupTableRow(final LookupTableDto table, final Long rowId) {
        return jooqReactiveOperationsCustomTables.mono(
                DSL.deleteFrom(DSL.table(DSL.name(table.tablesPojo().getTableName().toLowerCase())))
                    .where(DSL.field(ID_COLUMN).eq(rowId)))
            .then(Mono.empty());
    }

    private DDLQuery getRenameQuery(final ReferenceTableColumnDto inputColumnInfo,
                                    final LookupTablesDefinitionsPojo column,
                                    final String tableName) {
        if (!column.getColumnName().equals(inputColumnInfo.getName())) {
            return DSL.alterTable(table(DSL.name(tableName)))
                .renameColumn(DSL.name(column.getColumnName().toLowerCase()))
                .to(DSL.name(inputColumnInfo.getName().toLowerCase()));
        }
        return null;
    }

    private DDLQuery getNullableAndDefaultValueUpdateQuery(final ReferenceTableColumnDto inputColumnInfo,
                                                           final LookupTablesDefinitionsPojo column,
                                                           final String tableName,
                                                           final LookupTableColumnTypes type) {
        final String existedDefault = column.getDefaultValue();
        final String newDefault = inputColumnInfo.getDefaultValue();
        final AlterTableAlterStep<Object> alter = DSL.alterTable(tableName)
            .alterColumn(inputColumnInfo.getName().toLowerCase());

        if (isDefaultValueRequireUpdate(existedDefault, newDefault)) {
            if (StringUtils.isBlank(inputColumnInfo.getDefaultValue())) {
                return alter.dropDefault();
            } else {
                return alter.default_(DSL.inline(
                    type.getValidator().getValue(inputColumnInfo.getDefaultValue(), inputColumnInfo.getName()))
                );
            }
        } else if (!column.getIsNullable().equals(inputColumnInfo.isNullable())) {
            if (inputColumnInfo.isNullable()) {
                return alter.dropNotNull();
            } else {
                return alter.setNotNull();
            }
        }

        return null;
    }

    private Mono<?> getUniqueConstraintUpdateQuery(final ReferenceTableColumnDto inputColumnInfo,
                                                   final LookupTablesDefinitionsPojo column,
                                                   final String tableName) {
        if (!column.getIsUnique().equals(inputColumnInfo.isUnique())) {
            if (inputColumnInfo.isUnique()) {
                return jooqReactiveOperationsCustomTables.mono(DSL.alterTable(tableName)
                    .add(DSL.constraint().unique(field(inputColumnInfo.getName()))));
            } else {
                return dropUniqueConstraintOperation(tableName, column);
            }
        }
        return null;
    }

    private Mono<?> renameSequencesUpdateQuery(final String newColumnName,
                                               final LookupTablesDefinitionsPojo column,
                                               final String tableName) {
        final String template = buildSequenceNameTemplate(tableName, column.getColumnName());

        final SelectConditionStep<Record1<String>> sequences =
            getSequencesByNameTemplate(template);

        System.out.println("SEQ");
        return mapConstraintOrSequenceRecordsToNames(sequences)
            .map(constraintsList -> constraintsList
                .stream()
                .map(sequence -> jooqReactiveOperationsCustomTables
                    .mono(DSL.alterSequence(sequence)
                        .renameTo(
                            sequence.replace(column.getColumnName().toLowerCase(), newColumnName.toLowerCase()))
                    )
                )
            );
    }

    private Mono<?> renameConstraintUpdateQuery(final String newColumnName,
                                                final LookupTablesDefinitionsPojo column,
                                                final String tableName) {
        final SelectConditionStep<Record1<String>> constraintsRecords =
            getConstraintsByTableAndTemplateName(tableName,
                buildSequenceNameTemplate(tableName, column.getColumnName()));

        return mapConstraintOrSequenceRecordsToNames(constraintsRecords)
            .map(constraintsList -> constraintsList
                .stream()
                .map(constraint -> jooqReactiveOperationsCustomTables.mono(DSL.alterTable(tableName)
                    .renameConstraint(constraint)
                    .to(constraint.replace(column.getColumnName().toLowerCase(), newColumnName.toLowerCase())))
                )
                .collect(Collectors.toList())
            );
    }

    private Mono<?> dropUniqueConstraintOperation(final String tableName, final LookupTablesDefinitionsPojo column) {
//        RIGHT NOW COLUMN CAN HAVE ONLY ONE CONSTRAINT - UNIQUE
        final SelectConditionStep<Record1<String>> constraints =
            getConstraintsByTableAndTemplateName(tableName,
                buildSequenceNameTemplate(tableName, column.getColumnName()));

        return dropColumnConstraints(constraints, tableName);
    }

    private Mono<Integer> getOperation(final DDLQuery renameQuery) {
        return renameQuery != null
            ? jooqReactiveOperationsCustomTables.mono(renameQuery)
            : Mono.empty();
    }

    private Mono<Stream<Mono<Integer>>> dropColumnConstraints(
        final SelectConditionStep<Record1<String>> constraints,
        final String tableName) {
        return mapConstraintOrSequenceRecordsToNames(constraints)
            .map(constraintsList -> constraintsList
                .stream()
                .map(constraint -> jooqReactiveOperationsCustomTables
                    .mono(DSL.alterTable(tableName).dropConstraintIfExists(constraint))));
    }

    private Mono<List<String>> mapConstraintOrSequenceRecordsToNames(
        final SelectConditionStep<Record1<String>> records) {
        return jooqReactiveOperationsCustomTables.flux(records)
            .collectList()
            .map(item -> {
                System.out.println("WUTTT " + item.size());
                return item;
            })
            .map(sequenceList -> sequenceList.stream()
                .map(Record1::component1)
                .collect(Collectors.toList()));
    }

    private String buildSequenceNameTemplate(final String tableName, final String columnName) {
        return tableName
            .concat("_")
            .concat(columnName.toLowerCase())
            .concat("_%");
    }

    private SelectConditionStep<Record1<String>> getConstraintsByTableAndTemplateName(final String tableName,
                                                                                      final String nameTemplate) {
        return DSL.select(field("con.conname", String.class).as(CONSTRAINT_NAME))
            .from(table("pg_catalog.pg_constraint").as("con"))
            .join(table("pg_catalog.pg_class").as("rel"))
            .on(field("rel.oid").eq(field("con.conrelid")))
            .join(table("pg_catalog.pg_namespace").as("nsp"))
            .on(field("nsp.oid").eq(field("con.connamespace")))
            .where(field("nsp.nspname").eq(SCHEMA_NAME))
            .and(field("rel.relname").eq(tableName))
            .and(field("con.conname").like(nameTemplate));
    }

    private SelectConditionStep<Record1<String>> getSequencesByNameTemplate(final String template) {
        return DSL.select(field("sequencename", String.class).as(SEQUENCE_NAME))
            .from(table("pg_sequences"))
            .where(field("schemaname").eq(field("current_schema")))
            .and(field("sequencename").like(template));
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
