package org.opendatadiscovery.oddplatform.controller.exception;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.ErrorDetail;
import org.opendatadiscovery.oddplatform.api.contract.model.ErrorResponse;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.CascadeDeleteException;
import org.opendatadiscovery.oddplatform.exception.ErrorCode;
import org.opendatadiscovery.oddplatform.exception.ExceptionWithErrorCode;
import org.opendatadiscovery.oddplatform.exception.GenAIException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.exception.UniqueConstraintException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.support.WebExchangeBindException;

@RestControllerAdvice
@Slf4j
public class ControllerAdvice {

    @ExceptionHandler(BadUserRequestException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleBadRequest(final BadUserRequestException e) {
        return buildResponse(e);
    }

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(final NotFoundException e) {
        return buildResponse(e);
    }

    @ExceptionHandler(UniqueConstraintException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleUniqueConstraint(final UniqueConstraintException e) {
        return buildResponse(e);
    }

    @ExceptionHandler(CascadeDeleteException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleCascadeDelete(final CascadeDeleteException e) {
        return buildResponse(e);
    }

    @ExceptionHandler(WebExchangeBindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleException(final WebExchangeBindException e) {
        log.error("Data binding/validation failed", e);
        return buildResponse(e);
    }

    @ExceptionHandler(GenAIException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleGenAIException(final GenAIException e) {
        return buildResponse(e);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleServerException(final Exception e) {
        log.error("Internal server error", e);
        return buildResponse(new ExceptionWithErrorCode(ErrorCode.SERVER_EXCEPTION, "Internal Server Error"));
    }

    private ErrorResponse buildResponse(final ExceptionWithErrorCode e) {
        final ErrorResponse error = new ErrorResponse();
        error.setMessage(e.getMessage());
        error.setCode(e.getCode().getValue());
        error.setResolvable(e.getCode().isResolvable());
        error.setRetryable(e.getCode().isRetryable());
        return error;
    }

    private ErrorResponse buildResponse(final WebExchangeBindException e) {
        final ErrorResponse error = new ErrorResponse();
        error.setMessage(StringUtils.isNotEmpty(e.getReason()) ? e.getReason() : "Internal validation failed");
        error.setCode(ErrorCode.BAD_REQUEST.getValue());
        e.getFieldErrors().forEach(fe -> {
            final ErrorDetail detail = new ErrorDetail();
            detail.setField(fe.getField());
            detail.setMessage(fe.getDefaultMessage());
            error.addDetailsItem(detail);
        });
        return error;
    }
}
