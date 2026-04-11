package org.opendatadiscovery.oddplatform.exception;

public class BadUserRequestException extends ExceptionWithErrorCode {
    public BadUserRequestException(final String message, final Object... args) {
        super(ErrorCode.BAD_REQUEST, String.format(message, args));
    }
}
