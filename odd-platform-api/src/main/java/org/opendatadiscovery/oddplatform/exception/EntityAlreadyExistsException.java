package org.opendatadiscovery.oddplatform.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.CONFLICT)
public class EntityAlreadyExistsException extends RuntimeException {
    public EntityAlreadyExistsException() {
        super();
    }

    public EntityAlreadyExistsException(final String errorMessage) {
        super(errorMessage);
    }
}
