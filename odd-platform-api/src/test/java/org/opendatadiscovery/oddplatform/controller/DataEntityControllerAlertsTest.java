package org.opendatadiscovery.oddplatform.controller;

import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.Alert;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
import org.opendatadiscovery.oddplatform.service.AlertService;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit test for {@link DataEntityController#getDataEntityAlertsList} — the per-entity Alerts tab's new
 * filterable endpoint (#1763). Pins that it forwards the period + status filters to
 * {@link AlertService#getDataEntityAlertsList} and wraps the result as HTTP 200. Only {@code AlertService}
 * is needed; the other collaborators are left null (this endpoint uses none of them). Mirrors
 * {@code DataEntityControllerActivityTest}.
 */
@ExtendWith(MockitoExtension.class)
class DataEntityControllerAlertsTest {

    private static final OffsetDateTime BEGIN = OffsetDateTime.parse("2026-01-01T00:00:00Z");
    private static final OffsetDateTime END = OffsetDateTime.parse("2026-01-02T00:00:00Z");

    @Mock
    private AlertService alertService;
    @InjectMocks
    private DataEntityController controller;

    @Test
    void getDataEntityAlertsList_forwardsPeriodAndStatusAndWraps200() {
        when(alertService.getDataEntityAlertsList(anyLong(), any(), any(), any(), any(), any()))
            .thenReturn(Flux.just(new Alert()));

        StepVerifier.create(controller.getDataEntityAlertsList(42L, 1, 30, BEGIN, END, AlertStatus.RESOLVED, null))
            .assertNext(response -> assertThat(response.getStatusCode().value()).isEqualTo(200))
            .verifyComplete();

        verify(alertService).getDataEntityAlertsList(eq(42L), eq(BEGIN), eq(END), eq(AlertStatus.RESOLVED),
            eq(1), eq(30));
    }
}
