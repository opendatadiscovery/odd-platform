package org.opendatadiscovery.oddplatform.controller.exception;

import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Direct-call unit for the {@code ResponseStatusException} pass-through branches that have no
 * natural HTTP trigger in the running app (a framework-raised 5xx, a reason-less exception, a
 * non-404 4xx) — the HTTP-level paths (unmatched route → 404, invalid/missing input → 400) are
 * covered end-to-end by {@link org.opendatadiscovery.oddplatform.api.FrameworkErrorStatusMappingTest}.
 *
 * @regresses #1760, #1761 (the advice pass-through branch matrix)
 * @enforces ADR-0007 — centralised error translation
 */
class ControllerAdviceResponseStatusTest {

    private final ControllerAdvice advice = new ControllerAdvice();

    @Test
    void fourOhFourMapsToNotFoundCodeAndKeepsTheReason() {
        final ResponseEntity<ErrorResponse> response =
            advice.handleResponseStatus(new ResponseStatusException(HttpStatus.NOT_FOUND, "gone"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo("USR002");
        assertThat(response.getBody().getMessage()).isEqualTo("gone");
    }

    @Test
    void nonNotFoundClientErrorMapsToBadRequestAndFallsBackOverAnEmptyReason() {
        final ResponseEntity<ErrorResponse> response =
            advice.handleResponseStatus(new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo("USR001");
        // no reason supplied -> the status line itself, never null/blank
        assertThat(response.getBody().getMessage()).contains("405");
    }

    @Test
    void serverSideStatusKeepsItsCodeAndTheServerExceptionBody() {
        final ResponseEntity<ErrorResponse> response =
            advice.handleResponseStatus(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo("SYS001");
        assertThat(response.getBody().getRetryable()).isFalse();
        assertThat(response.getBody().getResolvable()).isFalse();
    }
}
