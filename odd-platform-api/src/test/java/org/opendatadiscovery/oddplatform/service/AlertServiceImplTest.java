package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.AlertMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAlertRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityService;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for alert reads/ingestion — validates F-014 (Per-Entity Alert View): the
 * per-entity alert list and counts both reject a non-existent (incl. soft-deleted) data entity with
 * NotFound (the shared checkDataEntityExistence guard); and F-007 (AlertManager Integration): ingesting
 * an EMPTY external-alert batch is a no-op that touches no repository. Exercised with Mockito +
 * StepVerifier. No prior AlertServiceImpl unit test.
 *
 * @validates F-014
 * @validates F-007
 */
@ExtendWith(MockitoExtension.class)
class AlertServiceImplTest {

    private static final long DE_ID = 1L;

    @Mock private ReactiveAlertRepository alertRepository;
    @Mock private ReactiveDataEntityRepository dataEntityRepository;
    @Mock private AlertMapper alertMapper;
    @Mock private AuthIdentityProvider authIdentityProvider;
    @Mock private ActivityService activityService;

    private AlertService service;

    @BeforeEach
    void setUp() {
        service = new AlertServiceImpl(alertRepository, dataEntityRepository, alertMapper, authIdentityProvider,
            activityService);
    }

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
