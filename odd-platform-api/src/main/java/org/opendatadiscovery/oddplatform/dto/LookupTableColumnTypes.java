package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.Getter;
import org.jooq.DataType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldType;
import org.opendatadiscovery.oddplatform.utils.lookup.validators.LookupBooleanValidator;
import org.opendatadiscovery.oddplatform.utils.lookup.validators.LookupCharValidator;
import org.opendatadiscovery.oddplatform.utils.lookup.validators.LookupDateValidator;
import org.opendatadiscovery.oddplatform.utils.lookup.validators.LookupDecimalValidator;
import org.opendatadiscovery.oddplatform.utils.lookup.validators.LookupIntegerValidator;
import org.opendatadiscovery.oddplatform.utils.lookup.validators.LookupJSONBValidator;
import org.opendatadiscovery.oddplatform.utils.lookup.validators.LookupTimestampValidator;
import org.opendatadiscovery.oddplatform.utils.lookup.validators.LookupTypesValidator;
import org.opendatadiscovery.oddplatform.utils.lookup.validators.LookupUUIDValidator;

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

    TYPE_VARCHAR(VARCHAR, "VARCHAR", DataSetFieldType.TypeEnum.CHAR, new LookupCharValidator()),

    TYPE_INTEGER(INTEGER, "INTEGER", DataSetFieldType.TypeEnum.INTEGER, new LookupIntegerValidator()),

    TYPE_SERIAL(INTEGER.identity(true), "SERIAL", DataSetFieldType.TypeEnum.INTEGER, new LookupIntegerValidator()),

    TYPE_DECIMAL(DECIMAL, "DECIMAL", DataSetFieldType.TypeEnum.NUMBER, new LookupDecimalValidator()),

    TYPE_BOOLEAN(BOOLEAN, "BOOLEAN", DataSetFieldType.TypeEnum.BOOLEAN, new LookupBooleanValidator()),

    TYPE_DATE(DATE, "DATE", DataSetFieldType.TypeEnum.DATETIME, new LookupDateValidator()),

    TYPE_TIME(TIMESTAMP, "TIME", DataSetFieldType.TypeEnum.TIME, new LookupTimestampValidator()),

//    TYPE_ENUM("ENUM"),

    TYPE_JSON(JSONB, "JSON", DataSetFieldType.TypeEnum.STRUCT, new LookupJSONBValidator()),

    TYPE_UUID(UUID, "UUID", DataSetFieldType.TypeEnum.CHAR, new LookupUUIDValidator());

    private final DataType<?> dataType;
    private final String type;
    private final DataSetFieldType.TypeEnum datasetFieldType;
    private final LookupTypesValidator validator;

    private static final Map<String, LookupTableColumnTypes> DICT = Arrays
        .stream(values())
        .collect(Collectors.toMap(LookupTableColumnTypes::getType, identity()));

    public static LookupTableColumnTypes resolveByTypeString(final String name) {
        return DICT.get(name);
    }

    LookupTableColumnTypes(final DataType<?> dataType,
                           final String type,
                           final DataSetFieldType.TypeEnum datasetFieldType,
                           final LookupTypesValidator validator) {
        this.dataType = dataType;
        this.type = type;
        this.datasetFieldType = datasetFieldType;
        this.validator = validator;
    }
}
