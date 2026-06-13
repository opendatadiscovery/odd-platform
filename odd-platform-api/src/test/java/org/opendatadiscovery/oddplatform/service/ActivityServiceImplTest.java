package org.opendatadiscovery.oddplatform.service;

import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.Activity;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityType;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityUserList;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityDto;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.mapper.ActivityMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveActivityRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityService;
import org.opendatadiscovery.oddplatform.service.activity.ActivityServiceImpl;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the Activity feed's view-mode dispatch — validates F-021 (Activity Feed)
 * and behaviorally enforces ADR-0022 (a single {@code ActivityType} param selects the fetch; null ≡ ALL).
 *
 * <p>The structural complement is {@code AdrActivityContractScanTest} (which scans the source shape); this
 * one EXERCISES the dispatch with mocked collaborators (Mockito + reactor-test {@code StepVerifier}),
 * pinning that each enum arm routes to the right repository fetch and that a null date is rejected before
 * any repository call. Surfaced from the {@code ActivityServiceImpl} uncovered-behaviour test-gap — no
 * prior ActivityServiceImpl unit test existed. Also pins the actor-username enumeration dispatch
 * (getActivityUsers → repository → mapper) added for the activity User filter fix (#1657).
 *
 * @validates F-021
 * @enforces ADR-0022
 */
@ExtendWith(MockitoExtension.class)
class ActivityServiceImplTest {

    private static final OffsetDateTime BEGIN = OffsetDateTime.parse("2026-01-01T00:00:00Z");
    private static final OffsetDateTime END = OffsetDateTime.parse("2026-01-02T00:00:00Z");

    @Mock private ReactiveActivityRepository activityRepository;
    @Mock private DataEntityRelationsService dataEntityRelationsService;
    @Mock private AuthIdentityProvider authIdentityProvider;
    @Mock private ActivityMapper activityMapper;

    private ActivityService service;

    @BeforeEach
    void setUp() {
        service = new ActivityServiceImpl(activityRepository, dataEntityRelationsService,
            authIdentityProvider, activityMapper, List.of());
    }

    @Test
    void getActivityList_nullBeginDate_errorsBadRequestWithoutTouchingTheRepository() {
        StepVerifier.create(service.getActivityList(null, END, 10, null, null, List.of(), List.of(),
                List.of(), List.of(), ActivityType.ALL, null, null, null))
            .verifyError(BadUserRequestException.class);
        verifyNoInteractions(activityRepository);
    }

    @Test
    void getActivityList_nullType_dispatchesToFetchAllActivities() {
        when(activityRepository.findAllActivities(any(), any(), any(), any(), any(), any(), any(), any(), any(),
            any(), any(), any())).thenReturn(Flux.just(new ActivityDto(null, null, null)));
        when(activityMapper.mapToActivity(any())).thenReturn(new Activity());

        StepVerifier.create(service.getActivityList(BEGIN, END, 10, null, null, List.of(), List.of(),
                List.of(), List.of(), null, null, null, null))
            .expectNextCount(1).verifyComplete();

        verify(activityRepository).findAllActivities(any(), any(), any(), any(), any(), any(), any(), any(), any(),
            any(), any(), any());
    }

    @Test
    void getActivityList_myObjects_dispatchesToFetchMyActivities() {
        when(authIdentityProvider.fetchAssociatedOwner()).thenReturn(Mono.just(new OwnerPojo().setId(7L)));
        when(activityRepository.findMyActivities(any(), any(), any(), any(), any(), any(), any(), any(), any(),
            any(), any(), any())).thenReturn(Flux.just(new ActivityDto(null, null, null)));
        when(activityMapper.mapToActivity(any())).thenReturn(new Activity());

        StepVerifier.create(service.getActivityList(BEGIN, END, 10, null, null, List.of(), List.of(),
                List.of(), List.of(), ActivityType.MY_OBJECTS, null, null, null))
            .expectNextCount(1).verifyComplete();

        verify(activityRepository).findMyActivities(any(), any(), any(), any(), any(), any(), any(), any(), any(),
            any(), any(), any());
        verify(activityRepository, never()).findAllActivities(any(), any(), any(), any(), any(), any(), any(), any(),
            any(), any(), any(), any());
    }

    @Test
    void getActivityList_downstream_dispatchesToFetchDependentActivities() {
        when(dataEntityRelationsService.getDependentDataEntityOddrns(eq(LineageStreamKind.DOWNSTREAM)))
            .thenReturn(Mono.just(List.of("oddrn://x")));
        when(activityRepository.findDependentActivities(any(), any(), any(), any(), any(), any(), any(), any(), any(),
            any(), any(), any())).thenReturn(Flux.just(new ActivityDto(null, null, null)));
        when(activityMapper.mapToActivity(any())).thenReturn(new Activity());

        StepVerifier.create(service.getActivityList(BEGIN, END, 10, null, null, List.of(), List.of(),
                List.of(), List.of(), ActivityType.DOWNSTREAM, null, null, null))
            .expectNextCount(1).verifyComplete();

        verify(dataEntityRelationsService).getDependentDataEntityOddrns(eq(LineageStreamKind.DOWNSTREAM));
        verify(activityRepository).findDependentActivities(any(), any(), any(), any(), any(), any(), any(), any(),
            any(), any(), any(), any());
    }

    @Test
    void getActivityUsers_delegatesToRepositoryAndMapsToUserList() {
        final Page<AssociatedOwnerDto> page = Page.<AssociatedOwnerDto>builder()
            .data(List.of()).total(0L).hasNext(false).build();
        when(activityRepository.getActivityUsers(1, 30, "al")).thenReturn(Mono.just(page));
        when(activityMapper.mapToActivityUserList(page)).thenReturn(new ActivityUserList());

        StepVerifier.create(service.getActivityUsers(1, 30, "al"))
            .expectNextCount(1).verifyComplete();

        verify(activityRepository).getActivityUsers(1, 30, "al");
        verify(activityMapper).mapToActivityUserList(page);
    }

    @Test
    void getDataEntityActivityList_threadsUsernamesToTheRepository() {
        when(activityRepository.findDataEntityActivities(any(), any(), any(), any(), any(), any(), any(), any(),
            any())).thenReturn(Flux.just(new ActivityDto(null, null, null)));
        when(activityMapper.mapToActivity(any())).thenReturn(new Activity());

        StepVerifier.create(service.getDataEntityActivityList(BEGIN, END, 10, 42L, List.of(), List.of("alice"),
                null, null, null))
            .expectNextCount(1).verifyComplete();

        verify(activityRepository).findDataEntityActivities(eq(BEGIN), eq(END), eq(10), eq(42L), any(),
            eq(List.of("alice")), any(), any(), any());
    }

    @Test
    void getActivityCounts_zipsTotalMyObjectsAndDependentCounts() {
        when(activityRepository.getTotalActivitiesCount(any(), any(), any(), any(), any(), any(), any(), any(),
            any())).thenReturn(Mono.just(10L));
        when(authIdentityProvider.fetchAssociatedOwner()).thenReturn(Mono.just(new OwnerPojo().setId(7L)));
        when(activityRepository.getMyObjectsActivitiesCount(any(), any(), any(), any(), any(), any(), any(), any(),
            any())).thenReturn(Mono.just(3L));
        when(dataEntityRelationsService.getDependentDataEntityOddrns(any()))
            .thenReturn(Mono.just(List.of("oddrn://x")));
        when(activityRepository.getDependentActivitiesCount(any(), any(), any(), any(), any(), any(), any(), any(),
            any())).thenReturn(Mono.just(2L));

        StepVerifier.create(service.getActivityCounts(BEGIN, END, null, null, List.of(), List.of(),
                List.of(), List.of("alice"), null))
            .assertNext(info -> {
                assertThat(info.getTotalCount()).isEqualTo(10L);
                assertThat(info.getMyObjectsCount()).isEqualTo(3L);
                assertThat(info.getDownstreamCount()).isEqualTo(2L);
                assertThat(info.getUpstreamCount()).isEqualTo(2L);
            })
            .verifyComplete();

        verify(activityRepository).getTotalActivitiesCount(any(), any(), any(), any(), any(), any(), any(),
            eq(List.of("alice")), any());
    }
}
