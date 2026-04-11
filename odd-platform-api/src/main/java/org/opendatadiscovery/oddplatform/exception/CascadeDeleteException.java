package org.opendatadiscovery.oddplatform.exception;

public class CascadeDeleteException extends ExceptionWithErrorCode {
    public CascadeDeleteException(final String message) {
        super(ErrorCode.CASCADE_DELETE, message);
    }
}
