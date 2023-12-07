package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.Getter;
import org.jooq.DataType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldType;

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

    TYPE_VARCHAR(VARCHAR, "VARCHAR", DataSetFieldType.TypeEnum.CHAR),

    TYPE_INTEGER(INTEGER, "INTEGER", DataSetFieldType.TypeEnum.INTEGER),

    TYPE_SERIAL(INTEGER.identity(true), "SERIAL", DataSetFieldType.TypeEnum.INTEGER),

    TYPE_DECIMAL(DECIMAL, "DECIMAL", DataSetFieldType.TypeEnum.NUMBER),

    TYPE_BOOLEAN(BOOLEAN, "BOOLEAN", DataSetFieldType.TypeEnum.BOOLEAN),

    TYPE_DATE(DATE, "DATE", DataSetFieldType.TypeEnum.DATETIME),

    TYPE_TIME(TIMESTAMP, "TIME", DataSetFieldType.TypeEnum.TIME),

//    TYPE_ENUM("ENUM"),

    TYPE_JSON(JSONB, "JSON", DataSetFieldType.TypeEnum.UNKNOWN),

    TYPE_UUID(UUID, "UUID", DataSetFieldType.TypeEnum.CHAR);

    private final DataType<?> dataType;
    private final String type;
    private final DataSetFieldType.TypeEnum datasetFieldType;

    private static final Map<String, LookupTableColumnTypes> DICT = Arrays
        .stream(values())
        .collect(Collectors.toMap(LookupTableColumnTypes::getType, identity()));

    public static LookupTableColumnTypes resolveByTypeString(final String name) {
        return DICT.get(name);
    }

    LookupTableColumnTypes(final DataType<?> dataType,
                           final String type,
                           final DataSetFieldType.TypeEnum datasetFieldType) {
        this.dataType = dataType;
        this.type = type;
        this.datasetFieldType = datasetFieldType;
    }
}
