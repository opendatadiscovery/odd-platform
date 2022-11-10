package org.opendatadiscovery.oddplatform.exception;

public class UniqueConstraintException extends ExceptionWithErrorCode {
    public UniqueConstraintException(final String message) {
        super(ErrorCode.UNIQUE_CONSTRAINT, message);
    }
}
