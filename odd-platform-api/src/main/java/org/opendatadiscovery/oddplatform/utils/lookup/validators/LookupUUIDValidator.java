package org.opendatadiscovery.oddplatform.utils.lookup.validators;

import org.apache.commons.lang3.StringUtils;
import org.jooq.DataType;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;

import static org.jooq.impl.SQLDataType.UUID;

public class LookupUUIDValidator implements LookupTypesValidator {
    @Override
    public DataType<?> getDataTypeWithDefaultValue(final String defaultValue, final String columnName) {
        return UUID.defaultValue(DSL.inline(getValidatedValue(defaultValue, columnName)));
    }

    @Override
    public Object getValue(final String value, final String columnName) {
        return getValidatedValue(value, columnName);
    }

    private java.util.UUID getValidatedValue(final String value, final String columnName) {
        if (StringUtils.isBlank(value)) {
            return null;
        }

        try {
            return java.util.UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new BadUserRequestException(ERROR_MESSAGE.formatted(value, columnName));
        }
    }
}
