package org.opendatadiscovery.oddplatform.exception;

import lombok.Getter;

@Getter
public class ExceptionWithErrorCode extends RuntimeException {
    protected final ErrorCode code;

    public ExceptionWithErrorCode(final ErrorCode errorCode, final String message) {
        super(message);
        this.code = errorCode;
    }
}
