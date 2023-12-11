package org.opendatadiscovery.oddplatform.repository.reactive;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.jetbrains.annotations.NotNull;
import org.jooq.ConstraintEnforcementStep;
import org.jooq.CreateSequenceFlagsStep;
import org.jooq.CreateTableElementListStep;
import org.jooq.DataType;
import org.jooq.Field;
import org.jooq.InsertValuesStepN;
import org.jooq.JSONB;
import org.jooq.Param;
import org.jooq.Record;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.annotation.ReactiveCustomTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableRowColumnFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableRowFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableRowList;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnDto;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnTypes;
import org.opendatadiscovery.oddplatform.dto.LookupTableDto;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableDto;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperationsCustomTables;
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

    private final JooqReactiveOperationsCustomTables jooqReactiveOperationsCustomTables;

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
    public Mono<Void> addColumnsToLookupTable(final String tableName, final List<LookupTableColumnDto> columnDtos) {
        final List<Field<?>> fields = new ArrayList<>();
        final List<ConstraintEnforcementStep> constraints = new ArrayList<>();

        for (final LookupTableColumnDto column : columnDtos) {
            DataType<?> dataType = column.getDataType().getDataType();

            if (StringUtils.isNotBlank(column.getDefaultValue())) {
                dataType = setDefaultValue(column.getDataType(), column.getDefaultValue());
            } else if (!column.isNullable()) {
                dataType = dataType.notNull();
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

                for (final LookupTableRowColumnFormData item : inputRow.getItems()) {
                    if (!field.getRight().getId().equals(item.getFieldId())) {
                        continue;
                    }

                    rowToInsert[i] = getValueToInsert(item.getValue(),
                        LookupTableColumnTypes.resolveByTypeString(field.getValue().getColumnType()));
                    isAdded = true;
                    break;
                }

                if (!isAdded) {
                    rowToInsert[i] = getValueToInsert(null,
                        LookupTableColumnTypes.resolveByTypeString(field.getValue().getColumnType()));
                }

                isAdded = false;
            }

            insertStep.values(rowToInsert);
        }

        System.out.println("SQl " + insertStep.getSQL());
        return jooqReactiveOperationsCustomTables.mono(insertStep)
            .onErrorResume(exception -> Mono.error(new BadUserRequestException(exception.getMessage())))
            .then(Mono.just(new LookupTableRowList()));
    }

    @NotNull
    private static Param<?> getValueToInsert(final String item, final LookupTableColumnTypes type) {
        switch (type) {
            case TYPE_VARCHAR -> {
                return DSL.val(item, type.getDataType());
            }
            case TYPE_INTEGER, TYPE_SERIAL -> {
                return DSL.val(item, type.getDataType());
            }
            case TYPE_DECIMAL -> {
                return DSL.val(item, type.getDataType());
            }
            case TYPE_BOOLEAN -> {
                return DSL.val(item, type.getDataType());
            }
            case TYPE_DATE -> {
                return DSL.val(item, type.getDataType());
            }
            case TYPE_TIME -> {
                return DSL.val(item, type.getDataType());
            }
            case TYPE_JSON -> {
                return DSL.val(item, type.getDataType());
            }
            case TYPE_UUID -> {
                return DSL.val(item, type.getDataType());
            }
            default -> throw new IllegalArgumentException(String.format("No entry with type %s was found", type));
        }
    }

    private DataType<?> setDefaultValue(final LookupTableColumnTypes type, final String defaultValue) {
        switch (type) {
            case TYPE_VARCHAR -> {
                final DataType<String> stringDataType = (DataType<String>) type.getDataType();

                return stringDataType.defaultValue(DSL.inline(defaultValue));
            }
            case TYPE_INTEGER, TYPE_SERIAL -> {
                final DataType<Integer> stringDataType = (DataType<Integer>) type.getDataType();

                return stringDataType.defaultValue(DSL.inline(Integer.valueOf(defaultValue)));
            }
            case TYPE_DECIMAL -> {
                final DataType<BigDecimal> stringDataType = (DataType<BigDecimal>) type.getDataType();

                return stringDataType.defaultValue(DSL.inline(new BigDecimal(defaultValue)));
            }
            case TYPE_BOOLEAN -> {
                final DataType<Boolean> stringDataType = (DataType<Boolean>) type.getDataType();

                return stringDataType.defaultValue(DSL.inline(Boolean.valueOf(defaultValue)));
            }
            case TYPE_DATE -> {
                final DataType<Date> stringDataType = (DataType<Date>) type.getDataType();

                return stringDataType.defaultValue(DSL.inline(Date.valueOf(defaultValue)));
            }
            case TYPE_TIME -> {
                final DataType<Timestamp> stringDataType = (DataType<Timestamp>) type.getDataType();

                return stringDataType.defaultValue(DSL.inline(Timestamp.valueOf(defaultValue)));
            }
            case TYPE_JSON -> {
                final DataType<JSONB> stringDataType = (DataType<JSONB>) type.getDataType();

                return stringDataType.defaultValue(DSL.inline(JSONB.valueOf(defaultValue)));
            }
            case TYPE_UUID -> {
                final DataType<UUID> stringDataType = (DataType<UUID>) type.getDataType();

                return stringDataType.defaultValue(DSL.inline(UUID.fromString(defaultValue)));
            }
            default -> throw new IllegalArgumentException(String.format("No entry with type %s was found", type));
        }
    }
}
