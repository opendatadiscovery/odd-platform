package org.opendatadiscovery.oddplatform.controller;

import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.Alert;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertCountInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatusFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertTotals;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertViewType;
import org.opendatadiscovery.oddplatform.service.AlertService;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit test for {@link AlertController} — the thin REST delegation layer for alerts. Pins that each endpoint
 * forwards its arguments to {@link AlertService} and wraps the result as HTTP 200: the new capable listing
 * ({@code getAlertsList} with the view-type + filters) and counts ({@code getAlertCounts}), the deprecated-but-
 * retained legacy endpoints ({@code getAllAlerts} / {@code getAssociatedUserAlerts} /
 * {@code getDependentEntitiesAlerts} / {@code getAlertTotals}), and the status flip. Plain Mockito (the
 * project's WebTestClient harness is disabled in CI — see {@code ActivityControllerTest}).
 */
@ExtendWith(MockitoExtension.class)
class AlertControllerTest {

    private static final OffsetDateTime BEGIN = OffsetDateTime.parse("2026-01-01T00:00:00Z");
    private static final OffsetDateTime END = OffsetDateTime.parse("2026-01-02T00:00:00Z");

    @Mock
    private AlertService alertService;
    @InjectMocks
    private AlertController controller;

    @Test
    void getAlertsList_forwardsTypeAndStatusFiltersAndWraps200() {
        when(alertService.getAlertList(any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
            .thenReturn(Flux.just(new Alert()));

        StepVerifier.create(controller.getAlertsList(1, 30, AlertViewType.ALL, BEGIN, END, 2L, 3L,
                List.of(4L), List.of(5L), AlertStatus.RESOLVED, null))
            .assertNext(response -> assertThat(response.getStatusCode().value()).isEqualTo(200))
            .verifyComplete();

        verify(alertService).getAlertList(eq(AlertViewType.ALL), eq(BEGIN), eq(END), eq(2L), eq(3L),
            eq(List.of(4L)), eq(List.of(5L)), eq(AlertStatus.RESOLVED), eq(1), eq(30));
    }

    @Test
    void getAlertCounts_forwardsFiltersAndWraps200() {
        when(alertService.getAlertCounts(any(), any(), any(), any(), any(), any(), any()))
            .thenReturn(Mono.just(new AlertCountInfo()));

        StepVerifier.create(controller.getAlertCounts(BEGIN, END, 2L, 3L, List.of(4L), List.of(5L),
                AlertStatus.OPEN, null))
            .assertNext(response -> assertThat(response.getStatusCode().value()).isEqualTo(200))
            .verifyComplete();

        verify(alertService).getAlertCounts(eq(BEGIN), eq(END), eq(2L), eq(3L), eq(List.of(4L)), eq(List.of(5L)),
            eq(AlertStatus.OPEN));
    }

    @Test
    void changeAlertStatus_delegatesToServiceAndWraps200() {
        when(alertService.updateStatus(eq(7L), eq(AlertStatus.RESOLVED))).thenReturn(Mono.just(new Alert()));

        StepVerifier.create(controller.changeAlertStatus(7L,
                Mono.just(new AlertStatusFormData().status(AlertStatus.RESOLVED)), null))
            .assertNext(response -> assertThat(response.getStatusCode().value()).isEqualTo(200))
            .verifyComplete();

        verify(alertService).updateStatus(7L, AlertStatus.RESOLVED);
    }

    @Test
    void getAlertTotals_legacy_delegatesAndWraps200() {
        when(alertService.getTotals()).thenReturn(Mono.just(new AlertTotals()));

        StepVerifier.create(controller.getAlertTotals(null))
            .assertNext(response -> assertThat(response.getStatusCode().value()).isEqualTo(200))
            .verifyComplete();

        verify(alertService).getTotals();
    }

    @Test
    void getAllAlerts_legacy_forwardsPageSizeAndWraps200() {
        when(alertService.listAll(eq(1), eq(30))).thenReturn(Mono.just(new AlertList()));

        StepVerifier.create(controller.getAllAlerts(1, 30, null))
            .assertNext(response -> assertThat(response.getStatusCode().value()).isEqualTo(200))
            .verifyComplete();

        verify(alertService).listAll(1, 30);
    }

    @Test
    void getAssociatedUserAlerts_legacy_forwardsPageSizeAndWraps200() {
        when(alertService.listByOwner(eq(2), eq(15))).thenReturn(Mono.just(new AlertList()));

        StepVerifier.create(controller.getAssociatedUserAlerts(2, 15, null))
            .assertNext(response -> assertThat(response.getStatusCode().value()).isEqualTo(200))
            .verifyComplete();

        verify(alertService).listByOwner(2, 15);
    }

    @Test
    void getDependentEntitiesAlerts_legacy_forwardsPageSizeAndWraps200() {
        when(alertService.listDependentObjectsAlerts(eq(1), eq(10))).thenReturn(Mono.just(new AlertList()));

        StepVerifier.create(controller.getDependentEntitiesAlerts(1, 10, null))
            .assertNext(response -> assertThat(response.getStatusCode().value()).isEqualTo(200))
            .verifyComplete();

        verify(alertService).listDependentObjectsAlerts(1, 10);
    }

    @Test
    void getAlertsList_nullDefaults_stillForwards() {
        when(alertService.getAlertList(any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
            .thenReturn(Flux.empty());

        StepVerifier.create(controller.getAlertsList(null, null, null, null, null, null, null, null, null, null,
                null))
            .assertNext(response -> assertThat(response.getStatusCode().value()).isEqualTo(200))
            .verifyComplete();

        verify(alertService).getAlertList(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
            isNull(), isNull(), isNull());
    }
}
