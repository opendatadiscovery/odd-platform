package org.opendatadiscovery.oddplatform.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum ErrorCode {
    BAD_REQUEST("USR001", false, true),
    NOT_FOUND("USR002", false, false),
    UNIQUE_CONSTRAINT("USR003", false, true),
    CASCADE_DELETE("USR004", false, true),
    SERVER_EXCEPTION("SYS001", false, false),
    DATABASE_EXCEPTION("SYS002", true, false);

    private final String value;

    private final boolean retryable;

    private final boolean resolvable;
}
