package org.opendatadiscovery.oddplatform.exception;

public class BadUserRequestException extends ExceptionWithErrorCode {
    public BadUserRequestException(final String message) {
        super(ErrorCode.BAD_REQUEST, message);
    }
}
