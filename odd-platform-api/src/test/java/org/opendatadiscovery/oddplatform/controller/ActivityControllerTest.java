package org.opendatadiscovery.oddplatform.controller;

import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.Activity;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityCountInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityType;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityUserList;
import org.opendatadiscovery.oddplatform.service.activity.ActivityService;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit test for {@link ActivityController} — the thin REST delegation layer for the activity feed.
 * Pins that each endpoint forwards its arguments (incl. the #1657 {@code usernames} actor filter and the
 * new {@code getActivityUsers} enumeration) to {@link ActivityService} and wraps the result as HTTP 200.
 * Plain Mockito (no WebTestClient — the project's WebTestClient harness is disabled in CI).
 */
@ExtendWith(MockitoExtension.class)
class ActivityControllerTest {

    private static final OffsetDateTime BEGIN = OffsetDateTime.parse("2026-01-01T00:00:00Z");
    private static final OffsetDateTime END = OffsetDateTime.parse("2026-01-02T00:00:00Z");

    @Mock
    private ActivityService activityService;
    @InjectMocks
    private ActivityController controller;

    @Test
    void getActivity_forwardsUsernamesAndWraps200() {
        when(activityService.getActivityList(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(),
            any(), any(), any())).thenReturn(Flux.just(new Activity()));

        StepVerifier.create(controller.getActivity(BEGIN, END, 30, null, null, List.of(), List.of(),
                List.of(1L), List.of("alice"), ActivityType.ALL, null, null, null, null))
            .assertNext(response -> assertThat(response.getStatusCode().value()).isEqualTo(200))
            .verifyComplete();

        verify(activityService).getActivityList(eq(BEGIN), eq(END), eq(30), any(), any(), any(), any(),
            eq(List.of(1L)), eq(List.of("alice")), eq(ActivityType.ALL), any(), any(), any());
    }

    @Test
    void getActivityCounts_forwardsUsernamesAndWraps200() {
        when(activityService.getActivityCounts(any(), any(), any(), any(), any(), any(), any(), any(), any()))
            .thenReturn(Mono.just(new ActivityCountInfo()));

        StepVerifier.create(controller.getActivityCounts(BEGIN, END, null, null, List.of(), List.of(),
                List.of(1L), List.of("alice"), null, null))
            .assertNext(response -> assertThat(response.getStatusCode().value()).isEqualTo(200))
            .verifyComplete();

        verify(activityService).getActivityCounts(eq(BEGIN), eq(END), any(), any(), any(), any(), eq(List.of(1L)),
            eq(List.of("alice")), any());
    }

    @Test
    void getActivityUsers_delegatesAndWraps200() {
        when(activityService.getActivityUsers(1, 30, "al")).thenReturn(Mono.just(new ActivityUserList()));

        StepVerifier.create(controller.getActivityUsers(1, 30, "al", null))
            .assertNext(response -> assertThat(response.getStatusCode().value()).isEqualTo(200))
            .verifyComplete();

        verify(activityService).getActivityUsers(1, 30, "al");
    }
}
