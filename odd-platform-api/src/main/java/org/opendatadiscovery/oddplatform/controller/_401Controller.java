package org.opendatadiscovery.oddplatform.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class _401Controller {
    @RequestMapping(
        method = RequestMethod.GET,
        value = "/api/handle401"
    )
    public Mono<ResponseEntity<Void>> responseWith401() {
        return Mono.just(new ResponseEntity<>(HttpStatus.UNAUTHORIZED));
    }
}
