package org.opendatadiscovery.oddplatform.controller;

import org.opendatadiscovery.oddplatform.api.contract.api.ErrorApi;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.exception.ForbiddenException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
public class ErrorController implements ErrorApi {

    @Override
    public Mono<ResponseEntity<AssociatedOwner>> getErrorDetails(final Integer errorCode,
                                                                 final ServerWebExchange exchange) {
        return switch (errorCode) {
            case 400:
                yield Mono.error(new IllegalArgumentException("Bad Request"));
            case 403:
                yield Mono.error(new ForbiddenException("Forbidden"));
            case 404:
                yield Mono.error(new NotFoundException("Not Found"));
            case 500:
                yield Mono.error(new RuntimeException("Internal Server Error"));
            default:
                yield Mono.error(new IllegalArgumentException("Bad Request"));
        };
    }
}
