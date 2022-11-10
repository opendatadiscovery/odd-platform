package org.opendatadiscovery.oddplatform.exception;

public class IllegalUserRequestException extends ExceptionWithErrorCode {
    public IllegalUserRequestException(final String message) {
        super(ErrorCode.BAD_REQUEST, message);
    }
}
