package org.opendatadiscovery.oddplatform.controller;

import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.Activity;
import org.opendatadiscovery.oddplatform.service.activity.ActivityService;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit test for {@link DataEntityController#getDataEntityActivity} — the per-entity Activity tab endpoint.
 * Pins that it forwards the #1657 {@code usernames} actor filter (alongside the kept {@code userIds}) to
 * {@link ActivityService#getDataEntityActivityList} and wraps the result as HTTP 200. Only {@code
 * ActivityService} is needed; the other collaborators are left null (this endpoint uses none of them).
 */
@ExtendWith(MockitoExtension.class)
class DataEntityControllerActivityTest {

    private static final OffsetDateTime BEGIN = OffsetDateTime.parse("2026-01-01T00:00:00Z");
    private static final OffsetDateTime END = OffsetDateTime.parse("2026-01-02T00:00:00Z");

    @Mock
    private ActivityService activityService;
    @InjectMocks
    private DataEntityController controller;

    @Test
    void getDataEntityActivity_forwardsUsernamesAndWraps200() {
        when(activityService.getDataEntityActivityList(any(), any(), any(), any(), any(), any(), any(), any(),
            any())).thenReturn(Flux.just(new Activity()));

        StepVerifier.create(controller.getDataEntityActivity(42L, BEGIN, END, 30, List.of(1L),
                List.of("alice"), null, null, null, null))
            .assertNext(response -> assertThat(response.getStatusCode().value()).isEqualTo(200))
            .verifyComplete();

        verify(activityService).getDataEntityActivityList(eq(BEGIN), eq(END), eq(30), eq(42L), eq(List.of(1L)),
            eq(List.of("alice")), any(), any(), any());
    }
}
