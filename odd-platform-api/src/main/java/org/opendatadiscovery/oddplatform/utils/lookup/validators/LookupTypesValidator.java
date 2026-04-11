package org.opendatadiscovery.oddplatform.utils.lookup.validators;

import org.jooq.DataType;

public interface LookupTypesValidator {

    String ERROR_MESSAGE = "Provided value %s does not belongs to %s";

    DataType<?> getDataTypeWithDefaultValue(final String defaultValue, final String columnName);

    Object getValue(final String value, final String columnName);
}
