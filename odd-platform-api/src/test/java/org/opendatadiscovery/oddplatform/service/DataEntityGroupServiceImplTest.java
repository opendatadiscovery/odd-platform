package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupFormData;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGroupEntityRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityService;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the Data Entity Group lifecycle — validates F-012 (Data Entity Group
 * Membership): a manually-created DEG is the only kind that may be UPDATED — updating a missing group
 * errors NotFound, and updating an INGESTED (not manually-created) group errors BadUserRequest
 * ("Can't update ingested data entity"). Exercised with Mockito + StepVerifier. No prior
 * DataEntityGroupServiceImpl unit test.
 *
 * @validates F-012
 */
@ExtendWith(MockitoExtension.class)
class DataEntityGroupServiceImplTest {

    private static final long DEG_ID = 1L;

    @Mock private NamespaceService namespaceService;
    @Mock private ActivityService activityService;
    @Mock private DataEntityFilledService dataEntityFilledService;
    @Mock private DataEntityStatisticsService dataEntityStatisticsService;
    @Mock private ReactiveDataEntityRepository reactiveDataEntityRepository;
    @Mock private ReactiveGroupEntityRelationRepository reactiveGroupEntityRelationRepository;
    @Mock private ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;
    @Mock private DataEntityMapper dataEntityMapper;

    private DataEntityGroupService service;

    @BeforeEach
    void setUp() {
        service = new DataEntityGroupServiceImpl(namespaceService, activityService, dataEntityFilledService,
            dataEntityStatisticsService, reactiveDataEntityRepository, reactiveGroupEntityRelationRepository,
            reactiveSearchEntrypointRepository, dataEntityMapper);
    }

    @Test
    void updateDataEntityGroup_nonExistentGroup_errorsNotFound() {
        when(reactiveDataEntityRepository.get(eq(DEG_ID))).thenReturn(Mono.empty());
        StepVerifier.create(service.updateDataEntityGroup(DEG_ID, new DataEntityGroupFormData()))
            .verifyError(NotFoundException.class);
    }

    @Test
    void updateDataEntityGroup_ingestedGroup_errorsBadRequestCannotEditIngested() {
        when(reactiveDataEntityRepository.get(eq(DEG_ID)))
            .thenReturn(Mono.just(new DataEntityPojo().setManuallyCreated(false)));
        StepVerifier.create(service.updateDataEntityGroup(DEG_ID, new DataEntityGroupFormData()))
            .verifyError(BadUserRequestException.class);
    }
}
