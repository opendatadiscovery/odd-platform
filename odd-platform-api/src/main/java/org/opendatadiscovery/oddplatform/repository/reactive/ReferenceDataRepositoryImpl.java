package org.opendatadiscovery.oddplatform.repository.reactive;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.ConstraintEnforcementStep;
import org.jooq.CreateSequenceFlagsStep;
import org.jooq.CreateTableElementListStep;
import org.jooq.DataType;
import org.jooq.Field;
import org.jooq.JSONB;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.annotation.ReactiveCustomTransactional;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnDto;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnTypes;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableDto;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperationsCustomTables;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.SQLDataType.INTEGER;

@Repository
@RequiredArgsConstructor
public class ReferenceDataRepositoryImpl implements ReferenceDataRepository {

    private final JooqReactiveOperationsCustomTables jooqReactiveOperationsCustomTables;

    @Override
    @ReactiveCustomTransactional
    public Mono<Void> createLookupTable(final ReferenceTableDto tableDto) {
        final CreateSequenceFlagsStep sequence =
            DSL.createSequence(tableDto.getNamespace() + "_" + tableDto.getTableName() + "_pk_sequence");
        final CreateTableElementListStep table =
            DSL.createTable(tableDto.getNamespace() + "_" + tableDto.getTableName())
                .column("id", INTEGER)
                .constraint(DSL.constraint().primaryKey("id"));

        return jooqReactiveOperationsCustomTables.mono(sequence)
            .then(jooqReactiveOperationsCustomTables.mono(table))
            .then(Mono.empty());
    }

    @Override
    @ReactiveCustomTransactional
    public Mono<Void> addColumnsToLookupTable(final String tableName, final List<LookupTableColumnDto> columnDtos) {
        System.out.println("WUTA " + tableName + " suze " + columnDtos.size());
        final List<Field<?>> fields = new ArrayList<>();
        final List<ConstraintEnforcementStep> constraints = new ArrayList<>();

        for (final LookupTableColumnDto column : columnDtos) {
            DataType<?> dataType = column.getDataType().getDataType();
            if (!column.isNullable()) {
                dataType = dataType.notNull();
            }

            if (StringUtils.isNotBlank(column.getDefaultValue())) {
                dataType = setDefaultValue(column.getDataType(), column.getDefaultValue());
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
