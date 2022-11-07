package org.opendatadiscovery.oddplatform.controller.exception;

import org.opendatadiscovery.oddplatform.api.contract.model.ErrorResponse;
import org.opendatadiscovery.oddplatform.exception.CascadeDeleteException;
import org.opendatadiscovery.oddplatform.exception.ForbiddenException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.exception.UniqueConstraintException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ControllerAdvice {

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleBadRequest(final IllegalArgumentException e) {
        final ErrorResponse error = new ErrorResponse();
        error.setMessage(e.getMessage());
        error.setCode("USR001");
        return error;
    }

    @ExceptionHandler(ForbiddenException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse handleForbidden(final ForbiddenException e) {
        final ErrorResponse error = new ErrorResponse();
        error.setMessage(e.getMessage());
        error.setCode("USR002");
        return error;
    }

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(final NotFoundException e) {
        final ErrorResponse error = new ErrorResponse();
        error.setMessage(e.getMessage());
        error.setCode("USR003");
        return error;
    }

    @ExceptionHandler(UniqueConstraintException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleUniqueConstraint(final UniqueConstraintException e) {
        final ErrorResponse error = new ErrorResponse();
        error.setMessage(e.getMessage());
        error.setCode("USR004");
        return error;
    }

    @ExceptionHandler(CascadeDeleteException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleCascadeDelete(final CascadeDeleteException e) {
        final ErrorResponse error = new ErrorResponse();
        error.setMessage(e.getMessage());
        error.setCode("USR005");
        return error;
    }

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleServerException(final RuntimeException e) {
        final ErrorResponse error = new ErrorResponse();
        error.setMessage(e.getMessage());
        error.setCode("SYS001");
        return error;
    }
}
