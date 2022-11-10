package org.opendatadiscovery.oddplatform.exception;

public class DatabaseException extends ExceptionWithErrorCode {
    public DatabaseException() {
        super(ErrorCode.DATABASE_EXCEPTION, "Unexpected database exception");
    }
}
