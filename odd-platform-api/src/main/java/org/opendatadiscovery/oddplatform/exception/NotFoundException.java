package org.opendatadiscovery.oddplatform.exception;

public class NotFoundException extends RuntimeException {
    public NotFoundException() {
        super();
    }

    public NotFoundException(final String message) {
        super(message);
    }

    public NotFoundException(final String message, final Object... bindings) {
        super(String.format(message, bindings));
    }
}
