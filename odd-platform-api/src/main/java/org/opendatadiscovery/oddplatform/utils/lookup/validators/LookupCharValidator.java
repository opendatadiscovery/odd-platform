package org.opendatadiscovery.oddplatform.utils.lookup.validators;

import org.jooq.DataType;
import org.jooq.impl.DSL;

import static org.jooq.impl.SQLDataType.VARCHAR;

public class LookupCharValidator implements LookupTypesValidator {
    @Override
    public DataType<?> getDataTypeWithDefaultValue(final String defaultValue, final String columnName) {
        return VARCHAR.defaultValue(DSL.inline(defaultValue));
    }

    @Override
    public Object getValue(final String value, final String columnName) {
        return value;
    }
}
