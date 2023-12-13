package org.opendatadiscovery.oddplatform.utils.lookup.validators;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.jooq.DataType;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;

import static org.jooq.impl.SQLDataType.BOOLEAN;

public class LookupBooleanValidator implements LookupTypesValidator {
    @Override
    public DataType<?> getDataTypeWithDefaultValue(final String defaultValue, final String columnName) {
        return BOOLEAN.defaultValue(DSL.inline(getValidatedValue(defaultValue, columnName)));
    }

    @Override
    public Object getValue(final String value, final String columnName) {
        return getValidatedValue(value, columnName);
    }

    private Boolean getValidatedValue(final String value, final String columnName) {
        if (StringUtils.isBlank(value)) {
            return null;
        }

        final Boolean parsedValue = BooleanUtils.toBooleanObject(value);
        if (parsedValue == null) {
            throw new BadUserRequestException(ERROR_MESSAGE.formatted(value, columnName));
        }

        return parsedValue;
    }
}
