package org.opendatadiscovery.oddplatform.exception;

public class GenAIException extends ExceptionWithErrorCode {

    public GenAIException(final String message) {
        super(ErrorCode.SERVER_EXCEPTION, message);
    }

    public GenAIException(final Throwable e) {
        super(ErrorCode.SERVER_EXCEPTION, e.getMessage());
    }
}
