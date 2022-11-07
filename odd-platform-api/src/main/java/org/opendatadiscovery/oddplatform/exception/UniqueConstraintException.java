package org.opendatadiscovery.oddplatform.exception;

public class UniqueConstraintException extends RuntimeException {
    public UniqueConstraintException(final String message) {
        super(message);
    }
}
