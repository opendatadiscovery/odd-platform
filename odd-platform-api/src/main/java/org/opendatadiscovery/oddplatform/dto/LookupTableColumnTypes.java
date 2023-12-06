package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.Getter;
import org.jooq.DataType;

import static java.util.function.Function.identity;
import static org.jooq.impl.SQLDataType.BOOLEAN;
import static org.jooq.impl.SQLDataType.DATE;
import static org.jooq.impl.SQLDataType.DECIMAL;
import static org.jooq.impl.SQLDataType.INTEGER;
import static org.jooq.impl.SQLDataType.JSONB;
import static org.jooq.impl.SQLDataType.TIMESTAMP;
import static org.jooq.impl.SQLDataType.UUID;
import static org.jooq.impl.SQLDataType.VARCHAR;

@Getter
public enum LookupTableColumnTypes {

    TYPE_VARCHAR(VARCHAR, "VARCHAR"),

    TYPE_INTEGER(INTEGER, "INTEGER"),

    TYPE_SERIAL(INTEGER.identity(true), "SERIAL"),

    TYPE_DECIMAL(DECIMAL, "DECIMAL"),

    TYPE_BOOLEAN(BOOLEAN, "BOOLEAN"),

    TYPE_DATE(DATE, "DATE"),

    TYPE_TIME(TIMESTAMP, "TIME"),

//    TYPE_ENUM("ENUM"),

    TYPE_JSON(JSONB, "JSON"),

    TYPE_UUID(UUID, "UUID");

    private final DataType<?> dataType;
    private final String type;

    private static final Map<String, LookupTableColumnTypes> DICT = Arrays
        .stream(values())
        .collect(Collectors.toMap(LookupTableColumnTypes::getType, identity()));

    public static LookupTableColumnTypes resolveByTypeString(final String name) {
        return DICT.get(name);
    }

    LookupTableColumnTypes(final DataType<?> dataType, final String type) {
        this.dataType = dataType;
        this.type = type;
    }
}
