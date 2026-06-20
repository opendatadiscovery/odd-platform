package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.Alert;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertViewType;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.alert.AlertDto;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.AlertMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAlertRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityService;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the alert read surface. Validates:
 * - F-014 (Per-Entity Alert View): the per-entity list + counts reject a non-existent (incl. soft-deleted)
 *   data entity with NotFound (the shared checkDataEntityExistence guard), legacy and new endpoints alike.
 * - F-007 (AlertManager Integration): ingesting an EMPTY external-alert batch is a no-op.
 * - #1763 (global alerts view hardening): the new capable getAlertList dispatches on the view-type
 *   discriminator (ALL / MY_OBJECTS / DOWNSTREAM / UPSTREAM, the lineage tabs reusing
 *   DataEntityRelationsService), and the status filter is plumbed through to the repository (a RESOLVED
 *   filter reaches the query; an absent status passes null = no filter — the regression guard for
 *   "resolved alerts unreachable on the global page"). The legacy listAll / getTotals / getDataEntityAlerts
 *   endpoints are kept unchanged for backward compatibility.
 *
 * @validates F-014
 * @validates F-007
 * @regresses 1763
 */
@ExtendWith(MockitoExtension.class)
class AlertServiceImplTest {

    private static final long DE_ID = 1L;
    private static final long OWNER_ID = 5L;

    @Mock private ReactiveAlertRepository alertRepository;
    @Mock private ReactiveDataEntityRepository dataEntityRepository;
    @Mock private AlertMapper alertMapper;
    @Mock private AuthIdentityProvider authIdentityProvider;
    @Mock private ActivityService activityService;
    @Mock private DataEntityRelationsService dataEntityRelationsService;

    private AlertService service;

    @BeforeEach
    void setUp() {
        service = new AlertServiceImpl(alertRepository, dataEntityRepository, alertMapper, authIdentityProvider,
            activityService, dataEntityRelationsService);
    }

    // --- New capable API (#1763) ---

    @Test
    void getAlertList_allView_resolvedStatus_plumbsStatusToRepository() {
        final AlertDto dto = mock(AlertDto.class);
        final Alert mapped = new Alert();
        when(alertRepository.listAllAlerts(any(), any(), any(), any(), any(), any(), any(), anyInt(), anyInt()))
            .thenReturn(Flux.just(dto));
        when(alertMapper.mapAlert(dto)).thenReturn(mapped);

        StepVerifier
            .create(service.getAlertList(AlertViewType.ALL, null, null, null, null, null, null, AlertStatus.RESOLVED,
                1, 30))
            .expectNext(mapped)
            .verifyComplete();

        // the RESOLVED status reaches the query — the #1763 fix (resolved alerts become reachable globally)
        verify(alertRepository).listAllAlerts(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
            eq(AlertStatusEnum.RESOLVED), eq(1), eq(30));
    }

    @Test
    void getAlertList_allView_nullStatus_passesNullNoFilter() {
        when(alertRepository.listAllAlerts(any(), any(), any(), any(), any(), any(), any(), anyInt(), anyInt()))
            .thenReturn(Flux.empty());

        StepVerifier
            .create(service.getAlertList(AlertViewType.ALL, null, null, null, null, null, null, null, 1, 30))
            .verifyComplete();

        verify(alertRepository).listAllAlerts(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
            isNull(), eq(1), eq(30));
    }

    @Test
    void getAlertList_myObjectsView_scopesToAssociatedOwner() {
        final AlertDto dto = mock(AlertDto.class);
        when(authIdentityProvider.fetchAssociatedOwner()).thenReturn(Mono.just(new OwnerPojo().setId(OWNER_ID)));
        when(alertRepository.listMyAlerts(any(), any(), any(), any(), any(), any(), any(), anyLong(), anyInt(),
            anyInt())).thenReturn(Flux.just(dto));
        when(alertMapper.mapAlert(dto)).thenReturn(new Alert());

        StepVerifier
            .create(service.getAlertList(AlertViewType.MY_OBJECTS, null, null, null, null, null, null, null, 1, 30))
            .expectNextCount(1)
            .verifyComplete();

        verify(alertRepository).listMyAlerts(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
            eq(OWNER_ID), eq(1), eq(30));
    }

    @Test
    void getAlertList_downstreamView_usesDownstreamLineageRelations() {
        when(dataEntityRelationsService.getDependentDataEntityOddrns(LineageStreamKind.DOWNSTREAM))
            .thenReturn(Mono.just(List.of("//oddrn/downstream")));
        when(alertRepository.listDependentAlerts(any(), any(), any(), any(), any(), any(), any(), any(), anyInt(),
            anyInt())).thenReturn(Flux.empty());

        StepVerifier
            .create(service.getAlertList(AlertViewType.DOWNSTREAM, null, null, null, null, null, null, null, 1, 30))
            .verifyComplete();

        verify(dataEntityRelationsService).getDependentDataEntityOddrns(LineageStreamKind.DOWNSTREAM);
        verify(alertRepository).listDependentAlerts(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
            isNull(), eq(List.of("//oddrn/downstream")), eq(1), eq(30));
    }

    @Test
    void getAlertList_upstreamView_usesUpstreamLineageRelations() {
        when(dataEntityRelationsService.getDependentDataEntityOddrns(LineageStreamKind.UPSTREAM))
            .thenReturn(Mono.just(List.of("//oddrn/upstream")));
        when(alertRepository.listDependentAlerts(any(), any(), any(), any(), any(), any(), any(), any(), anyInt(),
            anyInt())).thenReturn(Flux.empty());

        StepVerifier
            .create(service.getAlertList(AlertViewType.UPSTREAM, null, null, null, null, null, null, null, 1, 30))
            .verifyComplete();

        verify(dataEntityRelationsService).getDependentDataEntityOddrns(LineageStreamKind.UPSTREAM);
    }

    @Test
    void getAlertCounts_aggregatesAllFourTabCounts() {
        when(alertRepository.countAllAlerts(any(), any(), any(), any(), any(), any(), any()))
            .thenReturn(Mono.just(10L));
        when(authIdentityProvider.fetchAssociatedOwner()).thenReturn(Mono.just(new OwnerPojo().setId(OWNER_ID)));
        when(alertRepository.countMyAlerts(any(), any(), any(), any(), any(), any(), any(), anyLong()))
            .thenReturn(Mono.just(3L));
        when(dataEntityRelationsService.getDependentDataEntityOddrns(LineageStreamKind.DOWNSTREAM))
            .thenReturn(Mono.just(List.of("//d")));
        when(dataEntityRelationsService.getDependentDataEntityOddrns(LineageStreamKind.UPSTREAM))
            .thenReturn(Mono.just(List.of("//u")));
        when(alertRepository.countDependentAlerts(any(), any(), any(), any(), any(), any(), any(), any()))
            .thenReturn(Mono.just(2L));

        StepVerifier
            .create(service.getAlertCounts(null, null, null, null, null, null, AlertStatus.OPEN))
            .assertNext(counts -> {
                assertThat(counts.getTotalCount()).isEqualTo(10L);
                assertThat(counts.getMyObjectsCount()).isEqualTo(3L);
                assertThat(counts.getDownstreamCount()).isEqualTo(2L);
                assertThat(counts.getUpstreamCount()).isEqualTo(2L);
            })
            .verifyComplete();
    }

    @Test
    void getDataEntityAlertsList_nonExistentEntity_errorsNotFound() {
        when(dataEntityRepository.existsIncludingSoftDeleted(anyLong())).thenReturn(Mono.just(false));
        StepVerifier.create(service.getDataEntityAlertsList(DE_ID, null, null, null, 1, 10))
            .verifyError(NotFoundException.class);
    }

    // --- Legacy API (unchanged behaviour, kept for backward compatibility) ---

    @Test
    void getDataEntityAlerts_nonExistentEntity_errorsNotFound() {
        when(dataEntityRepository.existsIncludingSoftDeleted(anyLong())).thenReturn(Mono.just(false));
        StepVerifier.create(service.getDataEntityAlerts(DE_ID, 1, 10)).verifyError(NotFoundException.class);
    }

    @Test
    void getDataEntityAlertsCounts_nonExistentEntity_errorsNotFound() {
        when(dataEntityRepository.existsIncludingSoftDeleted(anyLong())).thenReturn(Mono.just(false));
        StepVerifier.create(service.getDataEntityAlertsCounts(DE_ID, AlertStatusEnum.OPEN))
            .verifyError(NotFoundException.class);
    }

    @Test
    void handleExternalAlerts_emptyBatch_isNoOpTouchingNoRepository() {
        StepVerifier.create(service.handleExternalAlerts(List.of())).verifyComplete();
        verifyNoInteractions(alertRepository, dataEntityRepository);
    }
}
