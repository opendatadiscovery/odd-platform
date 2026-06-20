package org.opendatadiscovery.oddplatform.service;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.Alert;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertList;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertTotals;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertViewType;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.alert.AlertDto;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.dto.alert.ExternalAlert;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.dto.security.UserDto;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.AlertMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAlertRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityService;
import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyMap;
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
    private static final long ALERT_ID = 7L;
    private static final Page<AlertDto> EMPTY_PAGE = new Page<>(List.of(), 0L, false);

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
    void getDataEntityAlertsList_existingEntity_appliesStatusFilterAndMaps() {
        final AlertDto dto = mock(AlertDto.class);
        final Alert mapped = new Alert();
        when(dataEntityRepository.existsIncludingSoftDeleted(anyLong())).thenReturn(Mono.just(true));
        when(alertRepository.getAlertsByDataEntityId(anyLong(), any(), any(), any(), anyInt(), anyInt()))
            .thenReturn(Flux.just(dto));
        when(alertMapper.mapAlert(dto)).thenReturn(mapped);

        StepVerifier.create(service.getDataEntityAlertsList(DE_ID, null, null, AlertStatus.RESOLVED, 1, 10))
            .expectNext(mapped)
            .verifyComplete();

        // the per-entity tab plumbs its status filter through (default null = all statuses; here RESOLVED)
        verify(alertRepository).getAlertsByDataEntityId(eq(DE_ID), isNull(), isNull(),
            eq(AlertStatusEnum.RESOLVED), eq(1), eq(10));
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

    // --- New capable API (#1763) — default-parameter behaviour ---

    @Test
    void getAlertList_nullArguments_defaultToAllViewAndDefaultPaging() {
        when(alertRepository.listAllAlerts(any(), any(), any(), any(), any(), any(), any(), anyInt(), anyInt()))
            .thenReturn(Flux.empty());

        // null type -> ALL view; null page/size -> the documented defaults (page 1, size 30); null status -> no filter
        StepVerifier
            .create(service.getAlertList(null, null, null, null, null, null, null, null, null, null))
            .verifyComplete();

        verify(alertRepository).listAllAlerts(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
            isNull(), eq(1), eq(30));
    }

    @Test
    void getDataEntityAlertsList_nullArguments_defaultToDefaultPagingAndAllStatuses() {
        when(dataEntityRepository.existsIncludingSoftDeleted(anyLong())).thenReturn(Mono.just(true));
        when(alertRepository.getAlertsByDataEntityId(anyLong(), any(), any(), any(), anyInt(), anyInt()))
            .thenReturn(Flux.empty());

        // null status -> all statuses (keeps the per-entity resolved history visible); null page/size -> 1, 30
        StepVerifier.create(service.getDataEntityAlertsList(DE_ID, null, null, null, null, null))
            .verifyComplete();

        verify(alertRepository).getAlertsByDataEntityId(eq(DE_ID), isNull(), isNull(), isNull(), eq(1), eq(30));
    }

    // --- Legacy read surface (kept byte-identical for backward compatibility — regression-locked here) ---

    @Test
    void listAll_returnsTheOpenAlertsPageMapped() {
        final AlertList mapped = new AlertList();
        when(alertRepository.listAllWithStatusOpen(1, 30)).thenReturn(Mono.just(EMPTY_PAGE));
        when(alertMapper.mapAlerts(EMPTY_PAGE)).thenReturn(mapped);

        StepVerifier.create(service.listAll(1, 30)).expectNext(mapped).verifyComplete();

        // the legacy "All" tab still hard-filters to OPEN (the #1763 capability lives on the new endpoint)
        verify(alertRepository).listAllWithStatusOpen(1, 30);
    }

    @Test
    void listByOwner_scopesToTheAssociatedOwner() {
        final AlertList mapped = new AlertList();
        when(authIdentityProvider.fetchAssociatedOwner()).thenReturn(Mono.just(new OwnerPojo().setId(OWNER_ID)));
        when(alertRepository.listByOwner(1, 30, OWNER_ID)).thenReturn(Mono.just(EMPTY_PAGE));
        when(alertMapper.mapAlerts(EMPTY_PAGE)).thenReturn(mapped);

        StepVerifier.create(service.listByOwner(1, 30)).expectNext(mapped).verifyComplete();

        verify(alertRepository).listByOwner(1, 30, OWNER_ID);
    }

    @Test
    void listDependentObjectsAlerts_resolvesOwnerObjectsThenLists() {
        final AlertList mapped = new AlertList();
        when(authIdentityProvider.fetchAssociatedOwner()).thenReturn(Mono.just(new OwnerPojo().setId(OWNER_ID)));
        when(alertRepository.getObjectsOddrnsByOwner(OWNER_ID)).thenReturn(Mono.just(List.of("//own")));
        when(alertRepository.listDependentObjectsAlerts(1, 30, List.of("//own"))).thenReturn(Mono.just(EMPTY_PAGE));
        when(alertMapper.mapAlerts(EMPTY_PAGE)).thenReturn(mapped);

        StepVerifier.create(service.listDependentObjectsAlerts(1, 30)).expectNext(mapped).verifyComplete();

        verify(alertRepository).listDependentObjectsAlerts(1, 30, List.of("//own"));
    }

    @Test
    void getTotals_aggregatesOpenAllMyAndDependentCounts() {
        when(alertRepository.countAlertsWithStatusOpen()).thenReturn(Mono.just(7L));
        when(authIdentityProvider.fetchAssociatedOwner()).thenReturn(Mono.just(new OwnerPojo().setId(OWNER_ID)));
        when(alertRepository.countAlertsWithStatusOpenByOwner(OWNER_ID)).thenReturn(Mono.just(3L));
        when(alertRepository.getObjectsOddrnsByOwner(OWNER_ID)).thenReturn(Mono.just(List.of("//own")));
        when(alertRepository.countDependentObjectsAlerts(List.of("//own"))).thenReturn(Mono.just(2L));

        StepVerifier.create(service.getTotals())
            .assertNext(totals -> {
                assertThat(totals.getTotal()).isEqualTo(7L);
                assertThat(totals.getMyTotal()).isEqualTo(3L);
                assertThat(totals.getDependentTotal()).isEqualTo(2L);
            })
            .verifyComplete();
    }

    @Test
    void getDataEntityAlertsCounts_existingEntity_returnsTheCount() {
        when(dataEntityRepository.existsIncludingSoftDeleted(anyLong())).thenReturn(Mono.just(true));
        when(alertRepository.getAlertsCountByDataEntityId(DE_ID, AlertStatusEnum.OPEN)).thenReturn(Mono.just(4L));

        StepVerifier.create(service.getDataEntityAlertsCounts(DE_ID, AlertStatusEnum.OPEN))
            .expectNext(4L)
            .verifyComplete();
    }

    // --- updateStatus state machine (switchIfEmpty/then assemble their Mono args eagerly — stubbed accordingly) ---

    @Test
    void updateStatus_toResolved_asCurrentUser_updatesAndMaps() {
        final AlertDto dto = mock(AlertDto.class);
        final Alert mapped = new Alert();
        when(authIdentityProvider.getCurrentUser()).thenReturn(Mono.just(new UserDto("alice", "provider")));
        when(alertRepository.updateAlertStatus(ALERT_ID, AlertStatusEnum.RESOLVED, "alice"))
            .thenReturn(Mono.just(new AlertPojo()));
        // the null-username fallback is assembled eagerly by switchIfEmpty even on the current-user path
        when(alertRepository.updateAlertStatus(ALERT_ID, AlertStatusEnum.RESOLVED, null))
            .thenReturn(Mono.just(new AlertPojo()));
        when(alertRepository.get(ALERT_ID)).thenReturn(Mono.just(dto));
        when(alertMapper.mapAlert(dto)).thenReturn(mapped);

        StepVerifier.create(service.updateStatus(ALERT_ID, AlertStatus.RESOLVED)).expectNext(mapped).verifyComplete();

        verify(alertRepository).updateAlertStatus(ALERT_ID, AlertStatusEnum.RESOLVED, "alice");
    }

    @Test
    void updateStatus_reopen_whenSameTypeOpenAlertAlreadyExists_errorsBadRequest() {
        when(alertRepository.openAlertWithTheSameTypeExistsForDataEntity(ALERT_ID)).thenReturn(Mono.just(true));
        // updateStatusMono is assembled (eager) but the same-type-open guard errors before it is subscribed
        when(authIdentityProvider.getCurrentUser()).thenReturn(Mono.empty());
        when(alertRepository.updateAlertStatus(ALERT_ID, AlertStatusEnum.OPEN, null)).thenReturn(Mono.empty());
        when(alertRepository.get(ALERT_ID)).thenReturn(Mono.just(mock(AlertDto.class)));

        // reopening is rejected while an open alert of the same type already exists for the data entity
        StepVerifier.create(service.updateStatus(ALERT_ID, AlertStatus.OPEN))
            .verifyError(BadUserRequestException.class);
    }

    @Test
    void updateStatus_reopen_whenNoSameTypeOpenAlert_reopensTheAlert() {
        final Alert mapped = new Alert();
        when(alertRepository.openAlertWithTheSameTypeExistsForDataEntity(ALERT_ID)).thenReturn(Mono.just(false));
        when(authIdentityProvider.getCurrentUser()).thenReturn(Mono.just(new UserDto("alice", "provider")));
        when(alertRepository.updateAlertStatus(ALERT_ID, AlertStatusEnum.OPEN, "alice"))
            .thenReturn(Mono.just(new AlertPojo()));
        when(alertRepository.updateAlertStatus(ALERT_ID, AlertStatusEnum.OPEN, null))
            .thenReturn(Mono.just(new AlertPojo()));
        when(alertRepository.get(ALERT_ID)).thenReturn(Mono.just(mock(AlertDto.class)));
        when(alertMapper.mapAlert(any())).thenReturn(mapped);

        StepVerifier.create(service.updateStatus(ALERT_ID, AlertStatus.OPEN)).expectNext(mapped).verifyComplete();

        verify(alertRepository).updateAlertStatus(ALERT_ID, AlertStatusEnum.OPEN, "alice");
    }

    // --- AlertManager ingestion (F-007) — the external-alert write path ---

    @Test
    void handleExternalAlerts_nonEmptyBatch_createsAnOpenDistributionAnomalyAlertForTheLabelledEntity() {
        final ExternalAlert external = new ExternalAlert();
        external.setLabels(Map.of("entity_oddrn", "//oddrn/entity"));
        external.setGeneratorURL(URI.create("http://prometheus/graph"));
        external.setStartsAt(LocalDateTime.parse("2026-06-20T10:00:00"));

        // createAlerts echoes the built alert back (id assigned), so its AlertUniqueConstraint matches its chunks
        final AlertPojo[] created = new AlertPojo[1];
        when(alertRepository.createAlerts(anyCollection())).thenAnswer(inv -> {
            final Collection<AlertPojo> in = inv.getArgument(0);
            created[0] = in.iterator().next().setId(1L);
            return Flux.fromIterable(in);
        });
        when(alertRepository.createChunks(anyList())).thenReturn(Mono.empty());
        when(alertRepository.get(anyList())).thenReturn(Mono.just(List.of(new AlertDto(
            new AlertPojo().setId(1L).setType(AlertTypeEnum.DISTRIBUTION_ANOMALY.getCode())
                .setStatus(AlertStatusEnum.OPEN.getCode()),
            List.of(), new DataEntityPojo().setId(99L), null))));
        when(activityService.createActivityEvents(anyList())).thenReturn(Mono.empty());
        when(alertRepository.setLastCreatedAt(anyMap())).thenReturn(Mono.empty());

        StepVerifier.create(service.handleExternalAlerts(List.of(external))).verifyComplete();

        assertThat(created[0].getDataEntityOddrn()).isEqualTo("//oddrn/entity");
        assertThat(created[0].getType()).isEqualTo(AlertTypeEnum.DISTRIBUTION_ANOMALY.getCode());
        assertThat(created[0].getStatus()).isEqualTo(AlertStatusEnum.OPEN.getCode());
    }

    @Test
    void applyAlertActions_createActionWhoseAlertHasNoChunks_errorsIllegalState() {
        final AlertPojo alert = new AlertPojo().setDataEntityOddrn("//e")
            .setType(AlertTypeEnum.DISTRIBUTION_ANOMALY.getCode());
        when(alertRepository.createAlerts(anyCollection())).thenReturn(Flux.just(alert.setId(1L)));
        // automaticallyResolveAlerts(...) is assembled eagerly by then(...) although the create error precedes it
        when(alertRepository.resolveAutomatically(anyList())).thenReturn(Mono.empty());
        when(alertRepository.get(anyList())).thenReturn(Mono.just(List.of()));

        // a create action whose alert maps to no chunks is rejected before any chunk row is written
        StepVerifier.create(service.applyAlertActions(List.of(new AlertAction.CreateAlertAction(alert, Map.of()))))
            .verifyError(IllegalStateException.class);
    }
}
