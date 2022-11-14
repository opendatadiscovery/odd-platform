package org.opendatadiscovery.oddplatform.exception;

import java.util.UUID;

import static org.apache.commons.lang3.StringUtils.capitalize;

public class NotFoundException extends ExceptionWithErrorCode {
    public NotFoundException(final String message) {
        super(ErrorCode.NOT_FOUND, message);
    }

    public NotFoundException() {
        super(ErrorCode.NOT_FOUND, "");
    }

    public NotFoundException(final String entityName, final Long id) {
        super(ErrorCode.NOT_FOUND, "%s with id %s is not found".formatted(capitalize(entityName), id));
    }

    public NotFoundException(final String entityName, final UUID uuid) {
        super(ErrorCode.NOT_FOUND, "%s with UUID %s is not found".formatted(capitalize(entityName), uuid));
    }

    public NotFoundException(final String entityName, final String oddrn) {
        super(ErrorCode.NOT_FOUND, "%s with oddrn %s is not found".formatted(capitalize(entityName), oddrn));
    }
}
