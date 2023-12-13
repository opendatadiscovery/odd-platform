package org.opendatadiscovery.oddplatform.utils.lookup.validators;

import org.apache.commons.lang3.StringUtils;
import org.jooq.DataType;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;

import static org.jooq.impl.SQLDataType.JSONB;

public class LookupJSONBValidator implements LookupTypesValidator {
    @Override
    public DataType<?> getDataTypeWithDefaultValue(final String defaultValue, final String columnName) {
        return JSONB.defaultValue(DSL.inline(getValidatedValue(defaultValue, columnName)));
    }

    @Override
    public Object getValue(final String value, final String columnName) {
        return getValidatedValue(value, columnName);
    }

    private org.jooq.JSONB getValidatedValue(final String value, final String columnName) {
        if (StringUtils.isBlank(value)) {
            return null;
        }

        try {
            return org.jooq.JSONB.valueOf(value);
        } catch (NumberFormatException e) {
            throw new BadUserRequestException(ERROR_MESSAGE.formatted(value, columnName));
        }
    }
}
